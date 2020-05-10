const ProjectService = {
    insertProject(db, project) {
        return db
            .into('wedo_projects')
            .insert(project)
            .returning('*')
            .then(rows => rows[0])
    },
    getProject(db, uuid) {
        return db
            .from('wedo_projects')
            .select('*')
            .where({ uuid })
    }
}

module.exports = ProjectService;