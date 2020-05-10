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

app.use(morgan(morganOption))
app.use(helmet()) // Obscures response headers
app.use(cors()) // Enables cross-origin resource sharing
app.use(function errorHandler(error, req, res, next) {
      let response;
      if (NODE_ENV === 'production') {
        response = { error: { message: 'server error' } }
      } else {
        console.error(error)
        response = { message: error.message, error }
      }
      res.status(500).json(response)
    })

app.get('/', (req, res) => {
    res.send("Hello boilerplate!");
})
app.use(ProjectRouter);

module.exports = app;