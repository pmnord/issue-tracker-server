"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
// const express = require('express');
var express_1 = __importDefault(require("express"));
var morgan_1 = __importDefault(require("morgan"));
var cors_1 = __importDefault(require("cors"));
var helmet_1 = __importDefault(require("helmet"));
var config_1 = __importDefault(require("./config"));
var project_router_1 = __importDefault(require("./project/project-router"));
var category_router_1 = __importDefault(require("./category/category-router"));
var task_router_1 = __importDefault(require("./task/task-router"));
var NODE_ENV = config_1.default.NODE_ENV, CLIENT_ORIGIN = config_1.default.CLIENT_ORIGIN;
var app = express_1.default();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
// Logging
var morganOption = NODE_ENV === 'production' ? 'tiny' : 'common';
app.use(morgan_1.default(morganOption)); // Logging middleware
app.use(helmet_1.default()); // Obscures response headers
app.use(cors_1.default({
    // Enables cross-origin resource sharing
    origin: CLIENT_ORIGIN, // Be sure to set the CLIENT_ORIGIN environmental variable when you hook up the front end
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
app.use('/api/project', project_router_1.default);
app.use('/api/category', category_router_1.default);
app.use('/api/task', task_router_1.default);
// io.on('connection', (socket) => {
//   socket.broadcast.emit('connection');
//   socket.on('update', (categories) => {
//     console.log(categories);
//     io.emit('update', categories);
//   });
//   socket.on('disconnect', () => {
//     io.emit('disconnect');
//   });
// });
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
module.exports = { app: app, http: http };
/* ------------------------------ Heroku Limits ----------------------------- */
// Each account has a pool of request tokens that can hold at most 4500 tokens. Each API call removes one token from the pool. Tokens are added to the account pool at a rate of roughly 75 per minute (or 4500 per hour), up to a maximum of 4500.
// Read More: https://devcenter.heroku.com/articles/platform-api-reference#rate-limits
