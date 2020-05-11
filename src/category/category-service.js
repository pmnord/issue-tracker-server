const CategoryService = {
    getCategoriesByProjectId(db, project_id) {
        return db
            .from('wedo_categories')
            .select('*')
            .where({ project_id })
    },
    insertCategory(db, category) {
        return db
            .into('wedo_categories')
            .insert(category)
            .returning('*')
            .then(rows => rows[0])
    },
    updateCategory(db, id, newValues) {
        return db
            .from('wedo_categories')
            .where({ id })
            .update(newValues)
            .returning('*')
            .then(rows => rows[0])
    },
    deleteCategory(db, id) {
        return db
            .from('wedo_categories')
            .where({ id })
            .delete()
    }
}

module.exports = CategoryService;