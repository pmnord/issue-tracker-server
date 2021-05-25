"use strict";
var _a = require('./app'), app = _a.app, http = _a.http;
var _b = require('./config'), PORT = _b.PORT, DATABASE_URL = _b.DATABASE_URL;
var knex = require('knex');
var db = knex({
    client: 'pg',
    connection: DATABASE_URL,
});
app.set('db', db);
http.listen(PORT, function () {
    console.log("Server listening at http://localhost:" + PORT);
});
