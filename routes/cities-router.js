const citiesRouter = require ("express").Router();
const { getCities } = require("../controllers/cities.controller")

//api/cities
citiesRouter
    .route('/')
    .get(getCities)

module.exports = citiesRouter;