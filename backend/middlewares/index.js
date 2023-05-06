const { check } = require("express-validator");
const { QueryTypes } = require("sequelize");

const { HTTP_STATUS_CODE, JWT_NAME, NOW } = require("../constants");
const { connection } = require("../models");
const { escape } = require("../utils");


class TodoMiddleware {
  /*
    ATTRIBUTES
  */
  static signIn = [
    check("email").trim().normalizeEmail().isEmail(),
    check("password").trim().isLength({ min: 8 }).escape(),
  ];

  static signUp = [
    ...this.signIn,
    check("name").trim().isLength({ min: 3, max: 254 }).escape(),
    check("image").trim().isBase64(),
  ];

  static me = [
    check(JWT_NAME).trim().isJWT(),
  ];

  static todo = [
    check("title").trim().isLength({ min: 3, max: 255 }).escape(),
    check("description").trim().isLength({ min: 100, max: 2000 }).escape(),
    check("image").trim().isBase64(),
    check("expired_at").trim().isNumeric(),
  ];

  static updateProfile = [
    check("name").trim().isLength({ min: 3, max: 254 }).escape(),
    check("image").trim().isBase64(),
    check("email").trim().normalizeEmail().isEmail(),
  ];

  /*
    METHODS
  */
  static async verifyUserId(req, res, next) {
    let catchStatus = HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, sequelize = null;

    try {
      sequelize = await connection();

      const { user_id } = req.query;
      const parsedId = parseInt(String(user_id), 10);

      if (isNaN(parsedId)) {
        catchStatus = HTTP_STATUS_CODE.BAD_REQUEST;
        throw new Error("Invalid user id");
      }

      const user = await sequelize.query(`SELECT id FROM users WHERE id=${parsedId} LIMIT 1`, {
        type: QueryTypes.SELECT,
        logging: false,
      });

      if (user.length !== 1) {
        catchStatus = HTTP_STATUS_CODE.BAD_REQUEST;
        throw new Error("No user with this id");
      }

      req.user_id = parsedId;
      next();
    }
    catch (e) {
      res.status(catchStatus).json({
        message: e.message || "Can't verify user id",
      });
    }
    finally {
      await sequelize?.close();
    }
  }

  static async verifyTodoOwner(req, res, next) {
    let catchStatus = HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, sequelize = null;

    try {
      const { id } = req.params;

      const parsedId = parseInt(String(id), 10);

      if (isNaN(parsedId)) {
        catchStatus = HTTP_STATUS_CODE.BAD_REQUEST;
        throw new Error("Invalid todo id");
      }

      sequelize = await connection();
      const { user_id } = req;

      const todo = await sequelize.query(`SELECT id FROM todos
        WHERE user_id=${user_id} AND id=${parsedId}
        LIMIT 1
      `, {
        type: QueryTypes.SELECT,
        logging: false,
      });

      if (todo.length !== 1) {
        catchStatus = HTTP_STATUS_CODE.BAD_REQUEST;
        throw new Error("Unknown user id or todo id");
      }

      req.todo_id = parsedId;
      next();
    }
    catch (e) {
      res.status(catchStatus).json({
        message: e.message || "Can't verify owner"
      })
    }
    finally {
      await sequelize?.close();
    }
  }

  static async verifyExpiredAt(req, res, next) {
    let catchStatus = HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR;

    try {
      const { expired_at } = req.body;
      const parsedExpiredAt = parseInt(expired_at, 10);

      if (expired_at <= NOW || isNaN(expired_at)) {
        catchStatus = HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR;
        throw new Error("Invalid expired at");
      }

      req.expired_at = parsedExpiredAt;
      delete req.body.expired_at;
      next();
    }
    catch (e) {
      res.status(catchStatus).json({
        message: e.message || "Can't verify expired at"
      })
    }
  }

  static async newPassword(req, res, next) {
    let catchStatus = HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR;

    try {
      let { password1, password2, password } = req.body;

      if (typeof password1 === "undefined" && typeof password2 === "undefined" && typeof password === "undefined") {
        next();
        return;
      }

      if (typeof password1 !== "string" || typeof password2 !== "string") {
        catchStatus = HTTP_STATUS_CODE.BAD_REQUEST;
        throw new Error("Invalid password");
      }

      password1 = password1.trim();
      password2 = password2.trim();

      if (password1 !== password2) {
        catchStatus = HTTP_STATUS_CODE.BAD_REQUEST;
        throw new Error("Passwords not equal");
      }

      if (password1.length < 8) {
        catchStatus = HTTP_STATUS_CODE.BAD_REQUEST;
        throw new Error("Invalid password length");
      }

      req.body.password = escape(password1);

      delete req.body.password1;
      delete req.body.password2;
      next();
    }
    catch (e) {
      console.log(e);
      res.status(catchStatus).json({
        message: e.message || "Can't change password"
      });
    }
  }
}

module.exports = {
  TodoMiddleware
}