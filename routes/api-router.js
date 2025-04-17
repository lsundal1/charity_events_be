const categoriesRouter = require("./categories-router");
const citiesRouter = require("./cities-router");
const eventsRouter = require("./events-router");
const usersRouter = require("./users-router");
const apiRouter = require("express").Router();

//api
apiRouter.use("/categories", categoriesRouter);
apiRouter.use("/cities", citiesRouter);
apiRouter.use("/events", eventsRouter);
apiRouter.use("/users", usersRouter);

module.exports = apiRouter;