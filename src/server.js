const { app, http } = require('./app');
const { PORT, DATABASE_URL } = require('./config');
const knex = require('knex');

const db = knex({
  client: 'pg',
  connection: DATABASE_URL,
});

app.set('db', db);

http.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
