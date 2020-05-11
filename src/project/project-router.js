const express = require('express');
const ProjectService = require('./project-service.js');
const CategoryService = require('../category/category-service');
const TaskService = require('../task/task-service');
const { nanoid } = require('nanoid');

const ProjectRouter = express.Router();

ProjectRouter
    .route('/')
    .get((req, res, next) =>
        res.send('The project home route is only available for POST requests. Did you mean to request the /api/project/:project_uuid route?')
    )
    .post((req, res, next) => {
        const uuid = nanoid();

        ProjectService.insertProject(
            req.app.get('db'),
            { uuid }
        )
            .then(project_uuid => res.json(project_uuid))
            .catch(next)
    })

ProjectRouter
    .route('/:project_uuid')
    .get((req, res, next) => {
        let project;

        // When the client requests a project, first validate that the project exists
        ProjectService.getProject(
            req.app.get('db'),
            req.params.project_uuid
        )
            .then(dbRes => {
                return dbRes.length > 0
                    ? project = { ...dbRes[0] }
                    : res.status(404).json({ Error: "Project not found" });
            })
            .then(async () => {
                await CategoryService.getCategoriesByProjectId(
                    req.app.get('db'),
                    project.id
                )
                    .then(dbRes => {
                        return project.categories = dbRes;
                    })
                
                for (let category of project.categories) {
                    await TaskService.getTasksByCategoryId(
                        req.app.get('db'),
                        category.id
                    )
                    .then(dbRes => {
                        return category.tasks = dbRes;
                    })
                }

                return res.status(200).json(project);
            })
            .catch(next)
    })

module.exports = ProjectRouter;