const express = require('express');
const TaskService = require('./task-service');
const jsonBodyParser = express.json();
const xss = require('xss');

const TaskRouter = express.Router();

TaskRouter.route('/').post(jsonBodyParser, (req, res, next) => {
  if (!req.body) {
    return res.status(400).json({ Error: `Missing request body` });
  }

  // Validate that necessary values are being sent by the client
  for (let prop of ['title', 'index', 'category_uuid']) {
    if (req.body[prop] === undefined) {
      return res
        .status(400)
        .json({ Error: `Missing '${prop}' property on request body` });
    }
  }

  const { uuid, title, index, category_uuid } = req.body;

  const newTask = {
    uuid,
    title: xss(title),
    index,
    category_uuid,
  };

  TaskService.insertTask(req.app.get('db'), newTask)
    .then((dbTask) => res.status(201).json(dbTask))
    .catch(next);
});

TaskRouter.route('/:task_uuid')
  .patch(jsonBodyParser, (req, res, next) => {
    if (!req.body) {
      return res.status(400).json({ Error: `Missing request body` });
    }

    /* If a task is moving within the Kanban board, you must include
    an array with the category object the task was moved from 
    and the category object that it was moved to. */

    if (req.body.toReIndex) {
      console.log('reindex fired');
      for (let category of req.body.toReIndex) {
        category.tasks.forEach(({ uuid }, idx) => {
          TaskService.updateTask(req.app.get('db'), uuid, {
            index: idx,
          });
        });
      }
      res.status(204).end();
    }
    const { title, tags, notes, category_uuid } = req.body;

    const newValues = {
      title,
      tags,
      notes,
      category_uuid,
    };

    TaskService.updateTask(req.app.get('db'), req.params.task_uuid, newValues)
      .then(() => res.status(204).end())
      .catch(next);
  })
  .delete(jsonBodyParser, (req, res, next) => {
    const { toReIndex } = req.body;
    const db = req.app.get('db');
    const task_uuid = req.params.task_uuid;

    toReIndex.forEach((task, idx) => {
      TaskService.updateTask(db, task.uuid, { index: idx });
    });

    TaskService.deleteTask(db, task_uuid)
      .then(() => res.status(204).end())
      .catch(next);
  });

module.exports = TaskRouter;
