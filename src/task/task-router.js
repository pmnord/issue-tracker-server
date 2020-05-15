const express = require('express');
const TaskService = require('./task-service');
const jsonBodyParser = express.json();
const xss = require('xss');

const TaskRouter = express.Router();

TaskRouter
    .route('/')
    .post(jsonBodyParser, (req, res, next) => {
        if (!req.body) { return res.status(400).json({ Error: `Missing request body` }) }

        // Validate that necessary values are being sent by the client
        for (let prop of ["title", "index", "category_id"]) {
            if (req.body[prop] === undefined) {
                return res.status(400).json({ Error: `Missing '${prop}' property on request body` })
            }
        }

        const { 
            title,
            index,
            category_id } = req.body;

        const newTask = {
            title: xss(title),
            index,
            category_id,
        };

        TaskService.insertTask(
            req.app.get('db'),
            newTask
        )
            .then(dbTask => res.status(201).json(dbTask))
            .catch(next)
    })

TaskRouter
    .route('/:task_id')
    .patch(jsonBodyParser, (req, res, next) => {
        if (!req.body) { return res.status(400).json({ Error: `Missing request body` }) }
        
        /* In case a task is swapping indexes with another task, the client must
        send a 'swapee' object containing the id of the object and its new index */
        if (req.body.swapee) {
            const { swapee } = req.body;

            TaskService.updateTask(
                req.app.get('db'),
                swapee.id,
                { index: swapee.index }
            );
        }

        const {
            title,
            index,
            tags,
            notes,
            category_id } = req.body;

        const newValues = {
            title,
            tags,
            notes,
            index,
            category_id
        };

        TaskService.updateTask(
            req.app.get('db'),
            req.params.task_id,
            newValues
        )
            .then(() => res.status(204).end())
            .catch(next);
       
    })
    .delete(jsonBodyParser, (req, res, next) => {
        const { toReIndex } = req.body;
        const db = req.app.get('db')

        toReIndex.forEach(task => {
            TaskService.updateTask(
                db,
                task.id,
                { index: task.index - 1 }
            );
        })

        TaskService.deleteTask(
            db,
            req.params.task_id
        )
            .then(() => res.status(204).end())
            .catch(next);
    })

module.exports = TaskRouter;