const { fetchEvents, fetchEvent, fetchAttendeesByEventId, addEvent, removeEvent, addAttendeeToEvent, removeAttendeeFromEvent } = require("../models/events.model");
const { fetchUser } = require("../models/users.model")

exports.getEvents = (req, res, next) => {

    const { sort_by = 'date', order = 'ASC', city, category } = req.query

    if(city || category){
        fetchEvents(sort_by, order, city, category).then((events) => {
            res.status(200).send({ events })
        })
        .catch(next)
    } else {
        fetchEvents(sort_by, order).then((events) => {
            res.status(200).send({ events })
        })
        .catch(next)
    }

};

exports.getEvent = (req, res, next) => {

    const { event_id } = req.params

    fetchEvent(event_id).then((event) => {

        res.status(200).send({event})
    })
    .catch(next)
}

exports.getAttendeesByEventId = (req, res, next) => {

    const { event_id } = req.params 

    fetchEvent(event_id).then(() => {

        return fetchAttendeesByEventId(event_id)

    })
    .then((attendees) => {

        res.status(200).send({attendees})

    })
    .catch(next)
}

exports.postEvent = (req, res, next) => {

    addEvent(req.body).then((newEvent) => {
        res.status(200).send({newEvent})
    })
    .catch(next)
}

exports.postAttendeeToEvent = (req, res, next) => {

    const { event_id } = req.params;
    const { user_id } = req.body;

    fetchUser(user_id).then(() => {

        return fetchEvent(event_id)
    })
    .then(() => {

        return addAttendeeToEvent(event_id, user_id)
    })
    .then((attendee) => {
        if (!attendee) {
        res.status(200).send({ msg: `User is already attending` });
        } else {
        res.status(201).send({ msg: `Attendee added successfully` });
        }
    })
    .catch(next);
};

exports.deleteAttendeeFromEvent = (req, res, next) => {

    const { event_id } = req.params;
    const { user_id } = req.body;

    
    return removeAttendeeFromEvent(event_id, user_id).then((result) => {
        if(result.rowCount === 0) {
            return Promise.reject({ status: 404, msg: 'Attendee not found for this event'})
        }
        res.status(204).send()
    })
    .catch(next)

}

exports.deleteEvent = (req, res, next) => {

    const { event_id } = req.params

    removeEvent(event_id).then(() => {
        res.status(204).send()
    })
    .catch(next)
}
