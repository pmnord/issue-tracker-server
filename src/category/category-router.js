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
            .then(dbCategory => res.status(201).json(dbCategory))
            .catch(err => {
                res.status(400).json({ error: `${err}`});
                next;
            })
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
    .delete(jsonBodyParser, (req, res, next) => {
        const db = req.app.get('db');
        console.log(req.body);

        CategoryService.deleteCategory(
            db,
            req.params.category_id
        )
            .then(async () => {
                const { toReIndex } = req.body;

                /* After deleting a category we need to adjust the indexes
                of the other categories accordingly */
                
                await toReIndex.forEach(category => {
                    CategoryService.updateCategory(
                        db,
                        category.id,
                        { index: category.index - 1 }
                    )
                })

                return res.status(204).end()
            })
            .catch(next)
    })

module.exports = CategoryRouter;