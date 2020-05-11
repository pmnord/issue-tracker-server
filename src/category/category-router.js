const express = require('express');
const CategoryService = require('./category-service');

const CategoryRouter = express.Router();

CategoryRouter
    .route('/:category_id')
    .post((req, res, next) => {
        const { title } = req.body;

        CategoryService.insertCategory(
            req.app.get('db'),
            { title }
        )
        .then(() => res.status(201).end())
        .catch(next)
    })
    .patch((req, res, next) => {
        const { title } = req.body;

        CategoryService.updateCategory(
            req.app.get('db'),
            { title }
        )
        .then(() => res.status(204).end())
        .catch(next)
    })
    .delete((req, res, next) => {
        const { category_id } = req.body;

        CategoryService.deleteCategory(
            req.app.get('db'),
            category_id
        )
        .then(() => res.status(204).end())
        .catch(next)
    })

module.exports = CategoryRouter;