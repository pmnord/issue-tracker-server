const app = require('./app');
const { PORT } = require('./config');
const knex = require('knex');

const db = knex({
    client: 'pg',
    connection: process.env.DATABASE_URL,
});

app.set('db', db);

app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`)
});
