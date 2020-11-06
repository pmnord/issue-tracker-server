const express = require('express');
const Haikunator = require('haikunator');
const ProjectService = require('./project-service.js');
const CategoryService = require('../category/category-service');
const TaskService = require('../task/task-service');
const xss = require('xss');

const ProjectRouter = express.Router();

const haikunator = new Haikunator();

ProjectRouter.route('/')
  .get((req, res, next) =>
    res
      .status(400)
      .send(
        'The project home route is only available for POST requests. Did you mean to request the /api/project/:project_uuid route?'
      )
  )
  .post((req, res, next) => {
    const uuid = haikunator.haikunate();

    ProjectService.insertProject(req.app.get('db'), { uuid })
      .then((project) => res.status(201).json(project.uuid))
      .catch(next);
  });

ProjectRouter.route('/:project_uuid').get((req, res, next) => {
  let project;
  let db = req.app.get('db');

  // Validate that the project exists
  ProjectService.getProject(db, req.params.project_uuid)
    .then((dbRes) => {
      // Handle requests for non-existing databases
      if (dbRes.length < 1) {
        return res.status(404).json({ Error: 'Project not found' });
      } else {
        project = { ...dbRes[0] };

        // Update the last_accessed date on every GET request
        // So that we can clear old projects
        return db.transaction((trx) =>
          trx
            .raw(
              `UPDATE wedo_projects
                            SET last_accessed=now()
                            WHERE id=${project.id}
                            `
            )
            .then(async () => {
              await CategoryService.getCategoriesByProjectId(
                db,
                project.id
              ).then((dbCategories) => {
                project.categories = dbCategories;
                project.categories.sort((a, b) => a.index - b.index);
              });

              for (let category of project.categories) {
                await TaskService.getTasksByCategoryUuid(
                  db,
                  category.uuid
                ).then((tasks) => {
                  // Tasks and notes are serialized for storage in the database
                  // We're parsing them here into an array that will be returned to the client
                  tasks.forEach((task) => {
                    if (!task.tags || task.tags.length === 0) {
                      task.tags = [];
                    } else {
                      task.tags = xss(task.tags)
                        .split(' ')
                        .map((tag) => tag.replace(/&#32;/g, ' '));
                    }
                    if (!task.notes || task.notes.length === 0) {
                      task.notes = [];
                    } else {
                      task.notes = xss(task.notes)
                        .split(' ')
                        .map((note) => note.replace(/&#32;/g, ' '));
                    }

                    task.title = xss(task.title);
                  });

                  category.tasks = tasks.sort((a, b) => a.index - b.index);
                  category.title = xss(category.title);

                  return;
                });
              }
              return res.status(200).json(project);
            })
        );
      }
    })
    .catch(next);
});

module.exports = ProjectRouter;
