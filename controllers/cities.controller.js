const { fetchCities } = require("../models/cities.model");

exports.getCities = (req, res, next) => {

    fetchCities().then((cities) => {
        res.status(200).send({cities})
    }).catch(next)

};

