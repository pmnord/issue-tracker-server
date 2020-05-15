const { nanoid } = require('nanoid');

const TestHelpers = {
    seedDbTables(db, projects, categories, tasks) {
        return db.transaction(async (trx) => {
            // The tables contain reference values to each other
            // Therefore we need to do this part async
            await trx.into('wedo_projects').insert(projects);
            await trx.raw(
                `SELECT setval('wedo_projects_id_seq', ?)`,
                [projects[projects.length - 1].id]
            );

            await trx.into('wedo_categories').insert(categories);
            await trx.raw(
                `SELECT setval('wedo_categories_id_seq', ?)`,
                [categories[categories.length - 1].id]
            );

            await trx.into('wedo_tasks').insert(tasks);
            await trx.raw(
                `SELECT setval('wedo_tasks_id_seq', ?)`,
                [tasks[tasks.length - 1].id]
            );
        });
    },
    truncateDbTables(db) {
        return db.transaction(trx =>
            trx.raw(
                `TRUNCATE
                    wedo_tasks,
                    wedo_categories,
                    wedo_projects
                `
            )
                .then(() =>
                    Promise.all([
                        trx.raw(`ALTER SEQUENCE wedo_tasks_id_seq minvalue 0 START WITH 1`),
                        trx.raw(`ALTER SEQUENCE wedo_categories_id_seq minvalue 0 START WITH 1`),
                        trx.raw(`ALTER SEQUENCE wedo_projects_id_seq minvalue 0 START WITH 1`),
                        trx.raw(`SELECT setval('wedo_tasks_id_seq', 0)`),
                        trx.raw(`SELECT setval('wedo_categories_id_seq', 0)`),
                        trx.raw(`SELECT setval('wedo_projects_id_seq', 0)`)
                    ])
                )
        )
    },
    makeTestProject() {
        return [
            {
                "id": 1,
                "uuid": nanoid()
            },
        ];
    },
    makeTestCategories() {
        return [
            {
                "id": 1,
                "title": "Project 1 Category 1",
                "index": 0,
                "project_id": 1
            },
            {
                "id": 2,
                "title": "Project 1 Category 2",
                "index": 1,
                "project_id": 1
            },
        ];
    },
    makeTestTasks() {
        return [
            {
                "id": 1,
                "title": "Foo",
                "index": 0,
                "tags": "foo bar",
                "notes": "lorem ipsum dolor sit amet",
                "category_id": 1
            },
            {
                "id": 2,
                "title": "Foo",
                "index": 1,
                "tags": "foo bar",
                "notes": "lorem ipsum dolor sit amet",
                "category_id": 1
            },
            {
                "id": 3,
                "title": "Foo",
                "index": 0,
                "tags": "foo bar",
                "notes": "lorem ipsum dolor sit amet",
                "category_id": 2
            },
            {
                "id": 4,
                "title": "Foo",
                "index": 1,
                "tags": "foo bar",
                "notes": "lorem ipsum dolor sit amet",
                "category_id": 2
            },
            {
                "id": 5,
                "title": "Foo",
                "index": 2,
                "tags": "foo bar",
                "notes": "lorem ipsum dolor sit amet",
                "category_id": 2
            },
        ];
    }
}

module.exports = TestHelpers;