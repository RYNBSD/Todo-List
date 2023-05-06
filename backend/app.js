const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const helmet = require("helmet");

const { HTTP_STATUS_CODE } = require("./constants");
const { initialDB } = require("./models");
const todoRouter = require("./routes");

// Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7)
const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(helmet());

initialDB();

app.use("/api/v1/", todoRouter);

app.use("*", (req, res) => {
  res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
    message: "Not found!",
  })
});

module.exports = app;
