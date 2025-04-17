const db = require("../db/connection");

exports.fetchEvents = (sort_by, order, city, category) => {

    const validColumns = ['date', 'city']

    const validOrder = ['ASC', 'DESC']

    if(!validColumns.includes(sort_by) || !validOrder.includes(order.toUpperCase())) {
        return Promise.reject({ status: 400, msg: 'bad request'})
    }

    let queryStr = `
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
        LEFT JOIN event_attendees ON events.event_id = event_attendees.event_id
        LEFT JOIN users ON event_attendees.user_id = users.user_id
    `;

    const queryParams = [];
    const whereClauses = [];

    if (city) {
        queryParams.push(city);
        whereClauses.push(`events.city_id = $${queryParams.length}`);
    }

    if (category) {
        queryParams.push(category);
        whereClauses.push(`events.category_id = $${queryParams.length}`);
    }

    if (whereClauses.length) {
        queryStr += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    queryStr += `
    GROUP BY 
        events.event_id, 
        cities.city_name, 
        categories.category_name, 
        categories.category_img
    ORDER BY ${sort_by} ${order.toUpperCase()};
    `;

    return db.query(queryStr, queryParams).then(({ rows }) => {
        if (rows.length === 0) {
            return Promise.reject({ status: 404, msg: 'Not Found' });
        }
        return rows;
    })
};

exports.fetchEvent = (event_id) => {

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
        LEFT JOIN event_attendees ON events.event_id = event_attendees.event_id
        LEFT JOIN users ON event_attendees.user_id = users.user_id
        WHERE events.event_id = $1
        GROUP BY 
            events.event_id, 
            cities.city_name, 
            categories.category_name, 
            categories.category_img;
    `;

    return db.query(query, [event_id]).then(({rows}) => {

        if(rows.length === 0) {
            return Promise.reject({ status: 404, msg: 'Event does not exist'})
        }

        return rows[0];

    })
}

exports.fetchAttendeesByEventId = (event_id) => {

    const query = `
    SELECT users.user_id, users.user_name 
    FROM users 
    JOIN event_attendees ON users.user_id = event_attendees.user_id
    WHERE event_attendees.event_id = $1;`

    return db.query(query, [event_id]).then(({rows}) => {
        return rows;
    })
}

exports.addEvent = (event) => {

    const { city_id, title, category_id, date, postcode, description } = event

    const query = `
    INSERT INTO events (city_id, title, category_id, date, postcode, description)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;`

    return db.query(query, [city_id, title, category_id, date, postcode, description]).then(({rows}) => {
        return rows[0]
    })
}

exports.addAttendeeToEvent = (event_id, user_id) => {

    const query = `INSERT INTO event_attendees (event_id, user_id) VALUES ($1, $2)  
    ON CONFLICT DO NOTHING
    RETURNING *;`;

    return db.query(query, [event_id, user_id]).then(({rows}) => {
        return rows[0]
    })

}

exports.removeAttendeeFromEvent = (event_id, user_id) => {

    const query = `DELETE FROM event_attendees WHERE event_id = $1 AND user_id = $2;`

    return db.query(query, [event_id, user_id])
}

exports.removeEvent = (event_id) => {

    const query = `DELETE FROM events WHERE event_id = $1;`

    return db.query(query,[event_id]).then(({rowCount}) => {
        if(rowCount === 0) {
            return Promise.reject({status: 404, msg: 'Event does not exist'})
        }
    })
}
