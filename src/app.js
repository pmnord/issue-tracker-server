require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');

const ProjectRouter = require('./project/project-router');

const app = express();

// Logging
const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption)); // Logging middleware
app.use(helmet()); // Obscures response headers
app.use(cors()); // Enables cross-origin resource sharing
app.use(function errorHandler(error, req, res, next) {
      let response;
      if (NODE_ENV === 'production') {
        response = { error: { message: 'server error' } }
      } else {
        console.error(error)
        response = { message: error.message, error }
      }
      res.status(500).json(response)
    });

app.get('/', (req, res) => {
    res.send("Hello boilerplate!");
});
app.use('/api/project', ProjectRouter);

module.exports = app;

/* ------------------------------ Heroku Limits ----------------------------- */

// Each account has a pool of request tokens that can hold at most 4500 tokens. Each API call removes one token from the pool. Tokens are added to the account pool at a rate of roughly 75 per minute (or 4500 per hour), up to a maximum of 4500.
// Read More: https://devcenter.heroku.com/articles/platform-api-reference#rate-limits