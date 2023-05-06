const HTTP_STATUS_CODE = Object.freeze({
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
});

const DB = Object.freeze({
  DATABASE: `${process.env.DB_DATABASE}`,
  USERNAME: `${process.env.DB_USERNAME}`,
  PASSWORD: `${process.env.DB_PASSWORD}`,
  HOST: `${process.env.DB_HOST}`,
});

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 1 week
const JWT_NAME = `${process.env.JWT_NAME}`;
const JWT_SECRET = `${process.env.JWT_SECRET}`;

const NOW = Math.floor(Date.now() / 1000); // seconds

module.exports = {
  HTTP_STATUS_CODE,
  DB,
  COOKIE_MAX_AGE,
  JWT_NAME,
  JWT_SECRET,
  NOW,
}