const app = require('../src/app.js');
const knex = require('knex');
const config = require('../src/config.js');
const TestHelpers = require('./test-helpers.js');
const { assert } = require('chai');

describe('Category endpoints', () => {
    let db;
    const testProject = TestHelpers.makeTestProject();
    const testCategories = TestHelpers.makeTestCategories();

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
    describe(`POST /category`, () => {
        beforeEach('Seed the database', () => TestHelpers.seedDbTables(db, testProject));

        it(`Returns 201 and inserts a new category into the database`, () => {
            return supertest(app)
                .post('/api/category')
                .send(testCategories[0])
                .set('api-key', config.WEDO_API_KEY)
                .expect(201)
                .then(() => {
                    return supertest(app)
                        .get(`/api/project/${testProject[0].uuid}`)
                        .set('api-key', config.WEDO_API_KEY)
                        .expect(200)
                        .expect(response => assert.equal(response.body.categories[0].title, testCategories[0].title));
                });
        });
    });

    describe(`PATCH /category/:category_id`, () => {
        beforeEach('Seed the database', () => TestHelpers.seedDbTables(db, testProject, [testCategories[0]]));

        it(`Returns 204 and updates a category`, () => {
            return supertest(app)
                .patch('/api/category/1')
                .set('api-key', config.WEDO_API_KEY)
                .send({ title: 'Changed Title' })
                .expect(204)
                .then(() => {
                    return supertest(app)
                        .get(`/api/project/${testProject[0].uuid}`)
                        .set('api-key', config.WEDO_API_KEY)
                        .expect(200)
                        .expect(response => assert.equal(response.body.categories[0].title, 'Changed Title'));
                });
        });
    });

    describe(`DELETE /category/:category_id`, () => {
        beforeEach('Seed the database', () => TestHelpers.seedDbTables(db, testProject, [testCategories[0]]));

        it(`Returns 204 and deletes a category`, () => {
            return supertest(app)
                .delete('/api/category/1')
                .set('api-key', config.WEDO_API_KEY)
                .send({ toReIndex: [] }) // delete requires an array of category_id to update the index of
                .expect(204)
                .then(() => {
                    return supertest(app)
                        .get(`/api/project/${testProject[0].uuid}`)
                        .set('api-key', config.WEDO_API_KEY)
                        .expect(200)
                        .expect(response => assert.equal(response.body.categories.length, 0));
                });
        });
    });

});