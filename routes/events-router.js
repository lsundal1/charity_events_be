const eventsRouter = require("express").Router();
const { getEvents, getEvent, getAttendeesByEventId, postEvent, deleteEvent, postAttendeeToEvent, deleteAttendeeFromEvent } = require("../controllers/events.controller");

//api/events
eventsRouter
    .route('/')
    .get(getEvents)
    .post(postEvent)

eventsRouter
    .route('/:event_id')
    .get(getEvent)
    .delete(deleteEvent)

eventsRouter
    .route('/:event_id/attendees')
    .get(getAttendeesByEventId)
    .post(postAttendeeToEvent)
    .delete(deleteAttendeeFromEvent)

module.exports = eventsRouter;