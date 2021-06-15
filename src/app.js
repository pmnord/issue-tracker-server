"use strict";
exports.__esModule = true;
require('dotenv').config();
var express = require("express");
var morgan = require("morgan");
var cors = require("cors");
var helmet = require("helmet");
var config = require("./config.js");
var ProjectRouter = require("./project/project-router.js");
var CategoryRouter = require("./category/category-router.js");
var TaskRouter = require("./task/task-router.js");
var NODE_ENV = config.NODE_ENV, CLIENT_ORIGIN = config.CLIENT_ORIGIN;
var app = express();
var httpServer = require('http').createServer(app);
var io = require('socket.io')(httpServer, {
    // Since Socket.IO v3, you need to explicitly enable Cross-Origin Resource Sharing (CORS)
    cors: {
        origin: CLIENT_ORIGIN,
        methods: ['GET', 'POST']
    }
});
// Logging
var morganOption = NODE_ENV === 'production' ? 'tiny' : 'common';
app.use(morgan(morganOption)); // Logging middleware
app.use(helmet()); // Obscures response headers
app.use(cors({
    // Enables cross-origin resource sharing
    origin: CLIENT_ORIGIN
}));
// API Key authentication
app.use(function (req, res, next) {
    var apiKey = req.get('api-key');
    if (!apiKey) {
        return res.status(400).json({ error: 'This server requires an API key' });
    }
    if (apiKey != process.env.WEDO_API_KEY) {
        return res.status(401).json({ error: 'Invalid API key' });
    }
    return next();
});
app.get('/', function (req, res) {
    res.send("You've reached the Collab API");
});
app.use('/api/project', ProjectRouter);
app.use('/api/category', CategoryRouter);
app.use('/api/task', TaskRouter);
var workspaces = io.of(/^\/api\/\w+-\w+-\d+$/g);
workspaces.on('connection', function (socket) {
    var workspace = socket.nsp;
    socket.broadcast.emit('connection');
    console.log("User connected to project " + workspace.name.replace('/api/', ''));
    socket.on('update', function (categories) {
        workspace.emit('update', categories);
    });
    socket.on('disconnect', function () {
        workspace.emit('disconnect');
        console.log("User disconnected from project " + workspace.name.replace('/api/', ''));
    });
});
// Error handler
app.use(function errorHandler(error, // This one might be wrong
req, res
// next: NextFunction
) {
    var response;
    if (NODE_ENV === 'production') {
        console.log(error);
        response = { error: { message: 'server error' } };
    }
    else {
        console.error(error);
        response = { message: error.message, error: error };
    }
    res.status(500).json(response);
});
module.exports = { app: app, http: httpServer };
/* ------------------------------ Heroku Limits ----------------------------- */
// Each account has a pool of request tokens that can hold at most 4500 tokens. Each API call removes one token from the pool. Tokens are added to the account pool at a rate of roughly 75 per minute (or 4500 per hour), up to a maximum of 4500.
// Read More: https://devcenter.heroku.com/articles/platform-api-reference#rate-limits
