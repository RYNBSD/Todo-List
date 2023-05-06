const { validationResult } = require("express-validator");
const { QueryTypes } = require("sequelize");
const cookie = require("cookie");

const { HTTP_STATUS_CODE, JWT_NAME, NOW } = require("../constants");
const { connection } = require("../models");
const { comparePassword, signToken, hashPassword, verifyToken } = require("../utils");


class TodoController {
  //* GET *//
  static async getTodos(req, res) {
    let catchStatus = HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, sequelize = null;

    try {
      sequelize  = await connection();

      const { user_id } = req;

      const todos = await sequelize.query(`SELECT * FROM todos WHERE user_id=${user_id}`, {
        type: QueryTypes.SELECT,
        logging: false,
      });

      todos.forEach(async todo => {
        if (todo.expired_at <= NOW) {
          todo.is_active = 0;
          await sequelize.query(`UPDATE todos SET is_active=0
            WHERE id=${todo.id}
          `, {
            type: QueryTypes.UPDATE,
            logging: false,
          });
        }

        todo.image = Buffer.from(todo.image, "base64").toString("base64");
      });

      const resStatus = todos.length ? HTTP_STATUS_CODE.OK : HTTP_STATUS_CODE.NO_CONTENT;

      res.status(resStatus).json({
        message: "success",
        data: todos,
      })
    }
    catch (e) {
      res.status(catchStatus).json({
        message: e.message || "Can't get todos",
      });
    }
    finally {
      await sequelize?.close();
    }
  }

  static async getTodoById(req, res) {
    let catchStatus = HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, sequelize = null;

    try {
      const { todo_id } = req;
      sequelize = await connection();

      const todo = await sequelize.query(`SELECT * FROM todos
        WHERE id=${todo_id}
      `, {
        type: QueryTypes.SELECT,
        logging: false,
      });

      todo[0].image = Buffer.from(todo[0].image, "base64").toString("base64");

      res.status(HTTP_STATUS_CODE.OK).json({
        message: "success",
        data: todo,
      });
    }
    catch (e) {
      res.status(catchStatus).json({
        message: e.message || "Can't get todo by id"
      });
    }
    finally {

    }
  }

  static async getUserProfile(req, res) {
    let catchStatus = HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, sequelize = null;

    try {
      const { user_id } = req;
      sequelize = await connection();

      const user = await sequelize.query(`SELECT * FROM users
        WHERE id=${user_id}
      `, {
        type: QueryTypes.SELECT,
        logging: false,
      });

      user[0].image = Buffer.from(user[0].image, 'base64').toString("base64");

      res.status(HTTP_STATUS_CODE.OK).json({
        message: "success",
        data: user
      })
    }
    catch (e) {
      res.status(catchStatus).json({
        message: e.message || "Can't get user profile",
      })
    }
    finally {
      await sequelize?.close();
    }
  }

  //* POST *//

  static async signIn(req, res) {
    let catchStatus = HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, sequelize = null;

    try {
      const error = validationResult(req);

      if (!error.isEmpty()) {
        catchStatus = HTTP_STATUS_CODE.BAD_REQUEST;
        throw new Error("Invalid email or password");
      }

      sequelize = await connection();

      const { email, password } = req.body;

      const user = await sequelize.query(`SELECT id, password from users
        WHERE email='${email}'
        LIMIT 1
      `, {
        type: QueryTypes.SELECT,
        logging: false
      });

      if (user.length !== 1) {
        catchStatus = HTTP_STATUS_CODE.BAD_REQUEST;
        throw new Error("Invalid email");
      }

      const isUserPasswordValid = comparePassword(password, user[0].password);

      if (!isUserPasswordValid) {
        catchStatus = HTTP_STATUS_CODE.BAD_REQUEST;
        throw new Error("Invalid password");
      }

      res.setHeader('Set-Cookie', cookie.serialize(JWT_NAME, String(signToken(user[0].id)), {
        // httpOnly: true,
        // secure: true,
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      }));

      res.status(HTTP_STATUS_CODE.OK).json({
        message: "success",
      })
    }
    catch (e) {
      res.status(catchStatus).json({
        message: e.message || "Can't signin",
      })
    }
    finally {
      await sequelize?.close();
    }
  }

  static async signUp(req, res) {
    let catchStatus = HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, sequelize = null;

    try {
      const error = validationResult(req);

      if (!error.isEmpty()) {
        catchStatus = HTTP_STATUS_CODE.BAD_REQUEST;
        throw new Error("Invalid name or email or password or image")
      }

      sequelize = await connection();
      const { name, email, password, image } = req.body;

      const hash = hashPassword(password);

      await sequelize.query(`INSERT INTO users(name, password, email, image)
        VALUES ('${name}', '${hash}', '${email}', '${image}')
      `, {
        type: QueryTypes.INSERT,
        logging: false,
      })

      res.status(HTTP_STATUS_CODE.CREATED).json({
        message: "success",
      });
    }
    catch (e) {
      res.status(catchStatus).json({
        message: e.message || "Can't signup",
      })
    }
    finally {
      await sequelize?.close();
    }
  }

  static me(req, res) {
    let catchStatus = HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR;

    try {
      const token = req.headers[JWT_NAME];

      const payload = verifyToken(token);

      if (!payload) {
        catchStatus = HTTP_STATUS_CODE.UNAUTHORIZED;
        throw new Error("Invalid token");
      }
      
      res.status(HTTP_STATUS_CODE.OK).json({
        message: "success",
        id: payload.id,
      });
    }
    catch (e) {
      res.status(catchStatus).json({
        message: e.message || "Can't authenticate",
      });
    }
  }

  static async addTodo(req, res) {
    let catchStatus = HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, sequelize = null;

    try {
      const error = validationResult(req);

      if (!error.isEmpty()) {
        catchStatus = HTTP_STATUS_CODE.BAD_REQUEST;
        throw new Error("Invalid name or description or image");
      }

      sequelize = await connection();
      const { user_id, expired_at } = req;
      const { title, description, image } = req.body;

      await sequelize.query(`INSERT INTO todos(title, description, image, expired_at, user_id)
        VALUES ('${title}', '${description}', '${image}', ${expired_at}, ${user_id})
      `, {
        type: QueryTypes.INSERT,
        logging: false,
      });

      res.status(HTTP_STATUS_CODE.CREATED).json({
        message: "success",
      });
    }
    catch (e) {
      res.status(catchStatus).json({
        message: e.message || "can't create new todo",
      });
    }
    finally {
      await sequelize?.close();
    }
  }

  //* PUT *//
  static async updateUser(req, res) {
    let catchStatus = HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, sequelize = null;

    try {
      const error = validationResult(req);

      if (!error.isEmpty()) {
        catchStatus = HTTP_STATUS_CODE.BAD_REQUEST;
        throw new Error("Invalid name or email or image");
      }

      const { user_id } = req;
      const { name, email, password, image } = req.body;
      sequelize = await connection();

      if (!password) {
        await sequelize.query(`UPDATE users SET
          name='${name}', email='${email}', image='${image}'
          WHERE id=${user_id}
        `, {
          type: QueryTypes.UPDATE,
          logging: false,
        });
      }
      else {
        const hash = hashPassword(password);

        await sequelize.query(`UPDATE users SET
          name='${name}', email='${email}', image='${image}', password='${hash}'
          WHERE id=${user_id}
        `, {
          type: QueryTypes.UPDATE,
          logging: false,
        });
      }

      res.status(HTTP_STATUS_CODE.OK).json({
        message: "success",
      });
    }
    catch (e) {
      res.status(catchStatus).json({
        message: e.message || "Can't update user",
      });
    }
    finally {
      await sequelize?.close();
    }
  }

  static async updateTodo(req, res) {
    let catchStatus = HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, sequelize = null;

    try {
      const error = validationResult(req);

      if (!error.isEmpty()) {
        catchStatus = HTTP_STATUS_CODE.BAD_REQUEST;
        throw new Error("Invalid name or description or image")
      }

      sequelize = await connection();
      const { user_id, todo_id, expired_at } = req;
      const { title, description, image } = req.body;

      const oldData = await sequelize.query(`SELECT expired_at, is_active FROM todos
        WHERE id=${todo_id} AND user_id=${user_id}
      `, {
        type: QueryTypes.SELECT,
        logging: false,
      });

      let changeExpiredAt = false, { expired_at: old_expired_at, is_active: old_is_active } = oldData[0];

      changeExpiredAt = expired_at > old_expired_at;

      await sequelize.query(`UPDATE todos SET
        title='${title}', description='${description}', expired_at=${expired_at}, is_active=${changeExpiredAt ? 1 : old_is_active}, image='${image}'
        WHERE id=${todo_id} AND user_id=${user_id}
      `, {
        type: QueryTypes.UPDATE,
        logging: false,
      });

      res.status(HTTP_STATUS_CODE.OK).json({
        message: "success",
      })
    }
    catch (e) {
      console.log(e);
      res.status(catchStatus).json({
        message: e.message || "Can't update todo",
      });
    }
    finally {
      await sequelize?.close();
    }
  }

  static async todoDone(req, res) {
    let catchStatus = HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, sequelize = null;

    try {
      sequelize = await connection();
      const { user_id, todo_id } = req;

      await sequelize.query(`UPDATE todos SET is_done=1
        WHERE id=${todo_id} AND user_id=${user_id}
      `, {
        type: QueryTypes.UPDATE,
        logging: false,
      });

      res.status(HTTP_STATUS_CODE.OK).json({
        message: "success",
      });
    }
    catch (e) {
      res.status(catchStatus).json({
        message: e.message || "Can't done todo",
      });
    }
    finally {
      await sequelize?.close();
    }
  }

  //* DELETE *//
  static async deleteUser(req, res) {
    let catchStatus = HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, sequelize = null;

    try {
      sequelize = await connection();
      const { user_id } = req;

      await sequelize.query(`DELETE FROM todos WHERE user_id=${user_id}`, {
        type: QueryTypes.DELETE,
        logging: false,
      });

      await sequelize.query(`DELETE FROM users WHERE id=${user_id}`, {
        type: QueryTypes.DELETE,
        logging: false,
      });

      res.status(HTTP_STATUS_CODE.OK).json({
        message: "success",
      });
    }
    catch (e) {
      res.status(catchStatus).json({
        message: e.message || "Can't delete user",
      });
    }
    finally {
      await sequelize?.close();
    }
  }

  static async deleteTodo(req, res) {
    let catchStatus = HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, sequelize = null;

    try {
      sequelize = await connection();

      const { todo_id } = req;

      await sequelize.query(`DELETE FROM todos WHERE id=${todo_id}`, {
        type: QueryTypes.DELETE,
        logging: false,
      });

      res.status(HTTP_STATUS_CODE.OK).json({
        message: "success",
      });
    }
    catch (e) {
      res.status(catchStatus).json({
        message: e.message || "Can't delete todo",
      });
    }
    finally {
      await sequelize?.close();
    }
  }
}

module.exports = {
  TodoController,
}