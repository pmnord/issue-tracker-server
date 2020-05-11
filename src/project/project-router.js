const express = require('express');
const ProjectService = require('./project-service.js');
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
        ProjectService.getProject(
            req.app.get('db'),
            req.params.project_uuid
        )
        .then(dbRes => {
            return dbRes.length > 0 
                ? res.json(dbRes[0])
                : res.status(404).json("Project not found");
        })
        .catch(next)
    })

module.exports = ProjectRouter;