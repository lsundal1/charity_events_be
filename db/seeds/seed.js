const format = require('pg-format');
const db = require('../connection');

const seed = ({ categoriesData, citiesData, eventsData, usersData, attendeesData }) => {

    return db.query('DROP TABLE IF EXISTS event_attendees;')
        .then(() => {
            return db.query('DROP TABLE IF EXISTS events;')
        })
        .then(() => {
            return db.query('DROP TABLE IF EXISTS users;');
        })
        .then(() => {
            return db.query('DROP TABLE IF EXISTS categories;');
        })
        .then(() => {
            return db.query('DROP TABLE IF EXISTS cities;');
        })
        .then(() => {

            const citiesPromise = db.query(`
                CREATE TABLE cities (
                    city_id SERIAL PRIMARY KEY,
                    city_name VARCHAR(50) NOT NULL
                );`);

            const categoriesPromise = db.query(`
                CREATE TABLE categories (
                    category_id SERIAL PRIMARY KEY,
                    category_name VARCHAR(50),
                    category_img VARCHAR NOT NULL
                );`);

            const usersPromise = db.query(`
                CREATE TABLE users (
                    user_id SERIAL PRIMARY KEY,
                    user_name VARCHAR(50) NOT NULL,
                    avatar VARCHAR(200) NOT NULL,
                    email VARCHAR(50) NOT NULL,
                    password VARCHAR(50) NOT NULL,
                    is_admin BOOLEAN NOT NULL
                );`);
    
            return Promise.all
            ([citiesPromise, categoriesPromise, usersPromise]);
        })
        .then(() => {

            return db.query(`
                CREATE TABLE events(
                    event_id SERIAL PRIMARY KEY,
                    city_id INT REFERENCES cities(city_id) ON DELETE CASCADE,
                    title VARCHAR NOT NULL,
                    category_id INT NOT NULL REFERENCES categories(category_id),
                    start_time DATE NOT NULL,
                    end_time DATE NOT NULL,
                    postcode VARCHAR(10),
                    description VARCHAR(150)
                );`);
        })
        .then(() => {

            return db.query(`
                CREATE TABLE event_attendees (
                    event_id INT REFERENCES events(event_id) ON DELETE CASCADE,
                    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
                    PRIMARY KEY (event_id, user_id)
                );`);

        })
        .then(() => {

            const insertCitiesQueryStr = format(
                'INSERT INTO cities (city_name) VALUES %L;', 
                citiesData.map(({city_name}) => [city_name])
            );

            return db.query(insertCitiesQueryStr);
        })
        .then(() => {

            const insertCategoriesQueryStr = 
            format(
                'INSERT INTO categories (category_name, category_img) VALUES %L RETURNING *;',
                categoriesData.map(({category_name, category_img}) => [category_name, category_img])
            );

            return db.query(insertCategoriesQueryStr);
        })
        .then(() => {

            const insertUsersQueryStr = format(
                'INSERT INTO users (user_name, avatar, email, password, is_admin) VALUES %L;',
                usersData.map(({ user_name, avatar, email, password, is_admin }) => [user_name, avatar, email, password, is_admin])
            );
    
            return db.query(insertUsersQueryStr)
        })    
        .then(() => {

            const insertEventsQueryStr = format (
                'INSERT INTO events (city_id, title, category_id, start_time, end_time, postcode, description) VALUES %L RETURNING event_id;', eventsData.map(({ city_id, title, category_id, start_time, end_time, postcode, description }) => [city_id, title, category_id, start_time, end_time, postcode, description])
            );

            return db.query(insertEventsQueryStr)
        })
        .then(() => {

            const insertAttendeesQueryStr = format(
                'INSERT INTO event_attendees (event_id, user_id) VALUES %L;',
                attendeesData
            );
            
            return db.query(insertAttendeesQueryStr);
        })
        .catch((err) => console.error('Error during seeding:', err));
};

module.exports = seed;