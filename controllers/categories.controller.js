const { fetchCategories, fetchCategory } = require("../models/categories.model");

exports.getCategories = (req, res, next) => {

    fetchCategories().then((categories) => {
        res.status(200).send({categories})
    }).catch(next)
    
};

exports.getCategory = (req,res,next) => {

    const { category_id } = req.params

    fetchCategory(category_id).then((category) => {
        res.status(200).send({category})
    })
    .catch(next)
}