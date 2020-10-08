const CategoryService = {
  getCategoriesByProjectId(db, project_id) {
    return db.from('wedo_categories').select('*').where({ project_id });
  },
  insertCategory(db, category) {
    return db
      .into('wedo_categories')
      .insert(category)
      .returning('*')
      .then((rows) => rows[0]);
  },
  updateCategory(db, uuid, newValues) {
    return db
      .from('wedo_categories')
      .where({ uuid: uuid })
      .update(newValues)
      .returning('*')
      .then((rows) => rows[0]);
  },
  deleteCategory(db, uuid) {
    return db.from('wedo_categories').where({ uuid }).delete();
  },
  deleteTasksInCategory(db, category_uuid) {
    return db.from('wedo_tasks').where({ category_uuid }).delete();
  },
};

module.exports = CategoryService;
