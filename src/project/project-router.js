const express = require('express');
const ProjectService = require('./project-service.js');

const jsonBodyParser = express.json();
const ProjectRouter = express.Router();

ProjectRouter
    .route('/project')
    .post((req, res, next) => {
        res.send('You posted to the project route');
    })

ProjectRouter
    .route('/project/:project_id')
    .get((req, res, next) => {
        res.send(`You requested the project with an id of ${req.params.project_id}`)
    })

module.exports = ProjectRouter;