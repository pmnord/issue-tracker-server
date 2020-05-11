const TaskService = {
    getTasksByCategoryId(db, category_id) {
        return db
            .from('wedo_tasks')
            .select('*')
            .where({ category_id })
    },
    insertTask(db, task) {
        return db
            .into('wedo_tasks')
            .insert(task)
            .returning('*')
            .then(rows => rows[0])
    },
    updateTask(db, id, newValues) {
        return db
            .from('wedo_tasks')
            .where({ id })
            .update(newValues)
            .returning('*')
            .then(rows => rows[0])
    },
    deleteTask(db, id) {
        return db
            .from('wedo_tasks')
            .where({ id })
            .delete()
    }
}

module.exports = TaskService;