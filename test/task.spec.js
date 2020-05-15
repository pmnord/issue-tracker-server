const app = require('../src/app.js');
const knex = require('knex');
const config = require('../src/config.js');
const TestHelpers = require('./test-helpers.js');
const { assert } = require('chai');

describe('Task endpoints', () => {
    let db;
    const testProject = TestHelpers.makeTestProject();
    const testCategories = TestHelpers.makeTestCategories();
    const testTasks = TestHelpers.makeTestTasks();

/* ---------------------------------- Hooks --------------------------------- */
    before('Create the db instance', () => {
        db = knex({
            client: 'pg',
            connection: config.TEST_DATABASE_URL,
        });
        app.set('db', db);
    });
    before('Clean the db tables', () => TestHelpers.truncateDbTables(db));
    after('Destroy the db instance', () => db.destroy());
    afterEach('Clean the database tables again', () => TestHelpers.truncateDbTables(db));

/* ---------------------------------- Tests --------------------------------- */
    describe(`POST /task`, () => {
        beforeEach('Seed the database', () => TestHelpers.seedDbTables(db, testProject, [ testCategories[0] ]));

        it(`Returns 201 and posts a new task`, () => {
            return supertest(app)
                .post('/api/task')
                .set('api-key', config.WEDO_API_KEY)
                .send(testTasks[0])
                .expect(201)
                .then(() => {
                    return supertest(app)
                        .get(`/api/project/${testProject[0].uuid}`)
                        .set('api-key', config.WEDO_API_KEY)
                        .expect(200)
                        .expect(response => assert.equal(response.body.categories[0].tasks[0].title, testTasks[0].title));
                });
        });
    });

    describe(`PATCH /task/:task_id`, () => {
        beforeEach('Seed the database', () => TestHelpers.seedDbTables(db, testProject, [ testCategories[0] ], [ testTasks[0] ]));

        it(`Returns 201 and posts a new task`, () => {
            return supertest(app)
                .patch('/api/task/1')
                .set('api-key', config.WEDO_API_KEY)
                .send({ title: 'A New Title' })
                .expect(204)
                .then(() => {
                    return supertest(app)
                        .get(`/api/project/${testProject[0].uuid}`)
                        .set('api-key', config.WEDO_API_KEY)
                        .expect(200)
                        .expect(response => assert.equal(response.body.categories[0].tasks[0].title, 'A New Title'));
                });
        });
    });

    describe(`DELETE /task/:task_id`, () => {
        beforeEach('Seed the database', () => TestHelpers.seedDbTables(db, testProject, [ testCategories[0] ], [ testTasks[0] ]));

        it(`Returns 201 and posts a new task`, () => {
            return supertest(app)
                .delete('/api/task/1')
                .set('api-key', config.WEDO_API_KEY)
                .send({ toReIndex: [] }) // The endpoint expects an array of task_id to reindex upon deletion
                .expect(204)
                .then(() => {
                    return supertest(app)
                        .get(`/api/project/${testProject[0].uuid}`)
                        .set('api-key', config.WEDO_API_KEY)
                        .expect(200)
                        .expect(response => assert.equal(response.body.categories[0].tasks.length, 0));
                });
        });
    });

});