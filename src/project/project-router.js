const express = require('express');
const { nanoid } = require('nanoid');
const ProjectService = require('./project-service.js');
const CategoryService = require('../category/category-service');
const TaskService = require('../task/task-service');
const xss = require('xss');

const ProjectRouter = express.Router();

ProjectRouter
    .route('/')
    .get((req, res, next) =>
        res.status(400).send('The project home route is only available for POST requests. Did you mean to request the /api/project/:project_uuid route?')
    )
    .post((req, res, next) => {
        const uuid = nanoid();

        ProjectService.insertProject(
            req.app.get('db'),
            { uuid }
        )
            .then(project => res.status(201).json(project.uuid))
            .catch(next)
    })

ProjectRouter
    .route('/:project_uuid')
    .get((req, res, next) => {
        let project;
        let db = req.app.get('db');

        // Validate that the project exists
        ProjectService.getProject(
            db,
            req.params.project_uuid
        )
            .then(dbRes => {
                return dbRes.length > 0
                    ? project = { ...dbRes[0] }
                    : res.status(404).json({ Error: "Project not found" });
            })
            .then(() => {
                // Update the last_accessed date on every GET request
                // So that we can clear old projects
                return db.transaction(trx =>
                    trx.raw(
                        `UPDATE wedo_projects
                            SET last_accessed=now()
                            WHERE id=${project.id}
                        `
                    )
                );
            })
            .then(async () => {
                await CategoryService.getCategoriesByProjectId(
                    db,
                    project.id
                )
                    .then(dbRes => {
                        return project.categories = dbRes;
                    })

                for (let category of project.categories) {
                    await TaskService.getTasksByCategoryId(
                        db,
                        category.id
                    )
                        .then(dbRes => {
                            const tasks = dbRes;
                            
                            // Set up each task's tags as an array
                            tasks.forEach(task => {
                                if (!task.tags) {task.tags = []}
                                else {
                                    // Because tags are being stored as text in the database,
                                    // we convert spaces into entity codes for storage
                                    // and then convert them back on retrieval.
                                    task.tags = task.tags.split(' ').map(str => str.replace(/&#32;/g, ' '));
                                    task.tags = xss(task.tags);
                                    task.notes = xss(task.notes);
                                    task.title = xss(task.title);
                                }
                            })
                            
                            category.tasks = tasks.sort((a, b) => a.index - b.index);
                            category.title = xss(category.title);
                            
                            return;
                        })
                }

                return res.status(200).json(project);
            })
            .catch(next)
    })

module.exports = ProjectRouter;