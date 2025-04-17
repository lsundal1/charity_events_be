const categoriesRouter = require ("express").Router();
const { getCategories, getCategory } = require("../controllers/categories.controller")

//api/categories
categoriesRouter
    .route('/')
    .get(getCategories)

categoriesRouter
    .route('/:category_id')
    .get(getCategory)

module.exports = categoriesRouter;