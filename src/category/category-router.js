const express = require('express');
const CategoryService = require('./category-service');
const jsonBodyParser = express.json();

const CategoryRouter = express.Router();

CategoryRouter
    .route('/')
    .post(jsonBodyParser, (req, res, next) => {
        if (!req.body) {return res.status(400).json({ Error: `Missing request body` })} 
        if (!req.body.title) {return res.status(400).json({ Error: `Missing 'title' property on request body` })}
        
        const { title, index, project_id } = req.body;

        const newCategory = {
            title,
            index,
            project_id,
        }

        CategoryService.insertCategory(
            req.app.get('db'),
            newCategory
        )
            .then(() => res.status(201).end())
            .catch(next)
    })

CategoryRouter
    .route('/:category_id')
    .patch(jsonBodyParser, (req, res, next) => {
        if (!req.body) {return res.status(400).json({ Error: `Missing request body` })}
        
        const { title, index } = req.body;

        const newValues = { title, index };

        CategoryService.updateCategory(
            req.app.get('db'),
            req.params.category_id,
            newValues
        )
            .then(() => res.status(204).end())
            .catch(next)
    })
    .delete((req, res, next) => {
        if (!req.body) {return res.status(400).json({ Error: `Missing request body` })}

        const { category_id } = req.body;

        CategoryService.deleteCategory(
            req.app.get('db'),
            category_id
        )
            .then(() => res.status(204).end())
            .catch(next)
    })

module.exports = CategoryRouter;