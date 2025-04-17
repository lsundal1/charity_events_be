const db = require('../db/connection')

exports.fetchCities = () => {

    const query = `SELECT * FROM cities;`

    return db.query(query).then(({rows}) => {
        return rows;
    })
};