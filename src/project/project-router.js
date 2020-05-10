const express = require('express');
const ProjectService = require('./project-service.js');

const jsonBodyParser = express.json();
const ProjectRouter = express.Router();

ProjectRouter
    .route('/')
    .get((req, res, next) => {
        res.send('The project home route is only available for POST requests. Did you mean to request the /api/project/:project_id route?')
    })
    .post((req, res, next) => {

        const uuid = Math.floor(Math.random * 1000000);

        ProjectService.insertProject(
            req.app.get('db'),
            { uuid }
        )
        .then(project_uuid => res.json(project_uuid))
    })

ProjectRouter
    .route('/:project_id')
    .get((req, res, next) => {
        res.send(`You requested the project with a uuid of ${req.params.project_id}`)
    })

module.exports = ProjectRouter;