const router = require("express").Router();

const { TodoController } = require("../controllers");
const { TodoMiddleware } = require("../middlewares");

//* GET *//
router.get("/todos", TodoMiddleware.verifyUserId, TodoController.getTodos);
router.get("/user", TodoMiddleware.verifyUserId, TodoController.getUserProfile);
router.get("/todo/:id", [TodoMiddleware.verifyUserId, TodoMiddleware.verifyTodoOwner], TodoController.getTodoById);

//* POST *//
router.post("/signin", TodoMiddleware.signIn, TodoController.signIn);
router.post("/signup", TodoMiddleware.signUp, TodoController.signUp);
router.post("/me", TodoMiddleware.me, TodoController.me);
router.post("/todo", [TodoMiddleware.verifyUserId, TodoMiddleware.todo, TodoMiddleware.verifyExpiredAt], TodoController.addTodo);

//* PUT *//
router.put("/user", [TodoMiddleware.verifyUserId, TodoMiddleware.updateProfile, TodoMiddleware.newPassword], TodoController.updateUser);
router.put("/todo/:id", [TodoMiddleware.todo, TodoMiddleware.verifyUserId, TodoMiddleware.verifyTodoOwner, TodoMiddleware.verifyExpiredAt], TodoController.updateTodo);
router.put("/todo/done/:id", [TodoMiddleware.verifyUserId, TodoMiddleware.verifyTodoOwner], TodoController.todoDone);

//* DELETE *//
router.delete("/user", TodoMiddleware.verifyUserId, TodoController.deleteUser);
router.delete("/todo/:id", [TodoMiddleware.verifyUserId, TodoMiddleware.verifyTodoOwner], TodoController.deleteTodo);

module.exports = router;