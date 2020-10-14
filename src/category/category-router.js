const express = require('express');
const CategoryService = require('./category-service');
const jsonBodyParser = express.json();
const xss = require('xss');

const CategoryRouter = express.Router();

CategoryRouter.route('/').post(jsonBodyParser, (req, res, next) => {
  if (!req.body) {
    return res.status(400).json({ Error: `Missing request body` });
  }
  if (!req.body.title) {
    return res
      .status(400)
      .json({ Error: `Missing 'title' property on request body` });
  }

  const { uuid, title, index, project_id } = req.body;

  const newCategory = {
    uuid,
    title: xss(title),
    index,
    project_id,
  };

  CategoryService.insertCategory(req.app.get('db'), newCategory)
    .then((dbCategory) => res.status(201).json(dbCategory))
    .catch((err) => {
      res
        .status(400)
        .json({ error: `${err}` })
        .catch(next);
    });
});

CategoryRouter.route('/:category_uuid')
  .patch(jsonBodyParser, (req, res, next) => {
    if (!req.body) {
      return res.status(400).json({ Error: `Missing request body` });
    }

    /* This endpoint is handling two cases, category names being updated and
    categories being reordered. Only one of those actions can happen at a time
    on the client side, so we separate the logic into two conditionals */

    if (req.body.title) {
      const newValues = {
        title: xss(req.body.title),
      };

      CategoryService.updateCategory(
        req.app.get('db'),
        req.params.category_uuid,
        newValues
      )
        .then(() => res.status(204).end())
        .catch(next);
    } else if (req.body.toReIndex) {
      req.body.toReIndex.forEach((category_uuid, idx) => {
        CategoryService.updateCategory(req.app.get('db'), category_uuid, {
          index: idx,
        });
      });
      res.status(204).end();
    } else {
      res.status(400).json({
        error:
          'Include either a new title or a collection of categories toReIndex',
      });
    }
  })
  .delete(jsonBodyParser, (req, res, next) => {
    const db = req.app.get('db');

    CategoryService.deleteCategory(db, req.params.category_uuid)
      .then(async () => {
        const { toReIndex } = req.body;

        /* After deleting a category we need to adjust the indexes
                of the other categories accordingly */

        await toReIndex.forEach((category) => {
          CategoryService.updateCategory(db, category.uuid, {
            index: category.index - 1,
          });
        });

        await CategoryService.deleteTasksInCategory(
          db,
          req.params.category_uuid
        );

        return res.status(204).end();
      })
      .catch(next);
  });

module.exports = CategoryRouter;
