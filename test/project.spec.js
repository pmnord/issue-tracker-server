const app = require('../src/app.js');
const knex = require('knex');
const config = require('../src/config.js');
const TestHelpers = require('./test-helpers.js');
const { assert } = require('chai');

describe('Project endpoints', () => {
    let db;
    const testProject = TestHelpers.makeTestProject;
    const testCategories = TestHelpers.makeTestCategories;
    const testTasks = TestHelpers.makeTestTasks;

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

    describe(`POST /project`, () => {
        it('Responds with 201 and a new project uuid', () => {
            return supertest(app)
                .post('/api/project')
                .set('api-key', config.WEDO_API_KEY)
                .expect(201)
                .expect(response => assert.typeOf(response.body, 'string'));
        });
    });

    describe.skip('GET /project/:uuid', () => {
        beforeEach('Seed the database', () => TestHelpers.seedDbTables(db, testProject, testCategories, testTasks));

        it('Responds with 200 and the project object', () => {
            return supertest(app)
                .get(`/api/project/${testProject[0].uuid}`)
                .set('api-key', config.WEDO_API_KEY)
                .expect(200)
                .expect(response => assert.typeOf(response.body, 'object'))
        })
    });
});