const usersRouter = require("express").Router();
const { getUsers, getUser, getEventsByUserId, postUser, deleteUser} = require("../controllers/users.controller");

//api/users
usersRouter
    .route('/')
    .get(getUsers)
    .post(postUser)

usersRouter
    .route('/:user_id')
    .get(getUser)
    .delete(deleteUser)

usersRouter
    .route('/:user_id/events')
    .get(getEventsByUserId)

module.exports = usersRouter;