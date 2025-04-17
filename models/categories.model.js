const db = require("../db/connection")

exports.fetchCategories = () => {

    const query = `SELECT * FROM categories;`

    return db.query(query).then(({rows}) => {
        return rows;
    })
};

exports.fetchCategory = (category_id) => {

    const query = `SELECT * FROM categories WHERE category_id = $1;`

    return db.query(query, [category_id]).then(({rows}) => {

        if (rows.length === 0){
            return Promise.reject({ status: 404, msg: 'Category does not exist'})
        }
        return rows[0]
    })

}