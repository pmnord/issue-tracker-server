require('dotenv').config();

// const express = require('express');
import { NextFunction, Request, Response } from 'express';
import * as express from 'express';
import * as morgan from 'morgan';
import * as cors from 'cors';
import * as helmet from 'helmet';

import * as config from './config.js';

import * as ProjectRouter from './project/project-router.js';
import * as CategoryRouter from './category/category-router.js';
import * as TaskRouter from './task/task-router.js';

const { NODE_ENV, CLIENT_ORIGIN } = config;

const app = express();
const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer, {
  // Since Socket.IO v3, you need to explicitly enable Cross-Origin Resource Sharing (CORS)
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

// Logging
const morganOption = NODE_ENV === 'production' ? 'tiny' : 'common';

app.use(morgan(morganOption)); // Logging middleware
app.use(helmet()); // Obscures response headers
app.use(
  cors({
    // Enables cross-origin resource sharing
    origin: CLIENT_ORIGIN, // Be sure to set the CLIENT_ORIGIN environmental variable when you hook up the front end
  })
);

// API Key authentication
app.use((req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.get('api-key');

  if (!apiKey) {
    return res.status(400).json({ error: 'This server requires an API key' });
  }
  if (apiKey != process.env.WEDO_API_KEY) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  return next();
});

app.get('/', (req: Request, res: Response) => {
  res.send("You've reached the Collab API");
});
app.use('/api/project', ProjectRouter);
app.use('/api/category', CategoryRouter);
app.use('/api/task', TaskRouter);

const workspaces = io.of(/^\/api\/\w+-\w+-\d+$/g);
workspaces.on('connection', (socket) => {
  const workspace = socket.nsp;

  socket.broadcast.emit('connection');
  console.log(
    `User connected to project ${workspace.name.replace('/api/', '')}`
  );

  type Category = {
    id: number;
    uuid: number;
    title: string;
    index: number;
    project_id: number;
  };

  socket.on('update', (categories: Array<Category>) => {
    workspace.emit('update', categories);
  });

  socket.on('disconnect', () => {
    workspace.emit('disconnect');
    console.log(
      `User disconnected from project ${workspace.name.replace('/api/', '')}`
    );
  });
});

// Error handler
app.use(function errorHandler(
  error: Error, // This one might be wrong
  req: Request,
  res: Response
  // next: NextFunction
): void {
  let response;
  if (NODE_ENV === 'production') {
    console.log(error);
    response = { error: { message: 'server error' } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = { app, http: httpServer };

/* ------------------------------ Heroku Limits ----------------------------- */

// Each account has a pool of request tokens that can hold at most 4500 tokens. Each API call removes one token from the pool. Tokens are added to the account pool at a rate of roughly 75 per minute (or 4500 per hour), up to a maximum of 4500.
// Read More: https://devcenter.heroku.com/articles/platform-api-reference#rate-limits
