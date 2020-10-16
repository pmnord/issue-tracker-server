const TaskService = {
  getTasksByCategoryUuid(db, category_uuid) {
    return db.from('wedo_tasks').select('*').where({ category_uuid });
  },
  insertTask(db, task) {
    return db
      .into('wedo_tasks')
      .insert(task)
      .returning('*')
      .then((rows) => rows[0]);
  },
  updateTask(db, uuid, newValues) {
    return db('wedo_tasks')
      .update(newValues)
      .where({ uuid })
      .returning('*')
      .then((rows) => rows[0]);
  },
  deleteTask(db, uuid) {
    return db.from('wedo_tasks').where({ uuid }).delete();
  },
};

module.exports = TaskService;
