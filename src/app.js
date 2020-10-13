require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV, CLIENT_ORIGIN } = require('./config');

const ProjectRouter = require('./project/project-router');
const CategoryRouter = require('./category/category-router');
const TaskRouter = require('./task/task-router');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

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
app.use((req, res, next) => {
  const apiKey = req.get('api-key');

  if (!apiKey) {
    return res.status(400).json({ error: 'This server requires an API key' });
  }
  if (apiKey != process.env.WEDO_API_KEY) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  return next();
});

app.get('/', (req, res) => {
  res.send("You've reached the WeDo API");
});
app.use('/api/project', ProjectRouter);
app.use('/api/category', CategoryRouter);
app.use('/api/task', TaskRouter);

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('update', (categories) => {
    console.log(categories);
    io.emit('update', categories);
  });
});

// Error handler
app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = { app, http };

/* ------------------------------ Heroku Limits ----------------------------- */

// Each account has a pool of request tokens that can hold at most 4500 tokens. Each API call removes one token from the pool. Tokens are added to the account pool at a rate of roughly 75 per minute (or 4500 per hour), up to a maximum of 4500.
// Read More: https://devcenter.heroku.com/articles/platform-api-reference#rate-limits
