const db = require("../db/connection")

exports.fetchUsers = () => {

    const query = `SELECT * FROM users;`

    return db.query(query).then(({rows}) => {
        return rows;
    })
};

exports.fetchUser = (user_id) => {

    const query = `SELECT * FROM users WHERE user_id = $1;`

    return db.query(query, [user_id]).then(({rows}) => {

        if (rows.length === 0){
            return Promise.reject({ status: 404, msg: 'User does not exist'})
        }
        return rows[0]
    })

}

exports.fetchEventsByUserId = (user_id) => {

    const query = `
    SELECT 
        events.*,
        cities.city_name,
        categories.category_name,
        categories.category_img,
        COALESCE(
            JSON_AGG(
                DISTINCT JSONB_BUILD_OBJECT(
                    'user_id', users.user_id,
                    'user_name', users.user_name,
                    'avatar', users.avatar
                )
            ) FILTER (WHERE users.user_id IS NOT NULL),
            '[]'
        ) AS attendees
    FROM events
    JOIN cities ON events.city_id = cities.city_id
    JOIN categories ON events.category_id = categories.category_id
    JOIN event_attendees AS user_events ON events.event_id = user_events.event_id
    LEFT JOIN event_attendees ON events.event_id = event_attendees.event_id
    LEFT JOIN users ON event_attendees.user_id = users.user_id
    WHERE user_events.user_id = $1
    GROUP BY 
        events.event_id, 
        cities.city_name, 
        categories.category_name, 
        categories.category_img;
    `;  

    return db.query(query, [user_id]).then(({rows}) => {
        return rows;
    })
}

exports.addUser = (user) => {

    const { user_name, avatar, email, password, is_admin } = user

    const query = `
    INSERT INTO users (user_name, avatar, email, password, is_admin) 
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;`

    return db.query(query, [user_name, avatar, email, password, is_admin]).then(({rows}) => {
        return rows[0]
    }) 
}

exports.removeUser = (user_id) => {

    const query = `DELETE FROM users WHERE user_id = $1;`

    return db.query(query,[user_id]).then(({rowCount}) => {
        if(rowCount === 0) {
            return Promise.reject({status: 404, msg: 'User does not exist'})
        }
    })
}
