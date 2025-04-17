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
    SELECT events.event_id, events.title, events.date 
    FROM events 
    JOIN event_attendees ON events.event_id = event_attendees.event_id
    WHERE event_attendees.user_id = $1;`

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
