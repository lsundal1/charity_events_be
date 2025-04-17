const app = require("../app.js");
const request = require("supertest");
const db = require("../db/connection.js");
const seed = require("../db/seeds/seed.js");
const {
  eventsData,
  usersData,
  citiesData,
  categoriesData,
  attendeesData,
} = require("../db/data/test-data/index.js");
const endpoints = require("../endpoints.json");

beforeEach(() => {
  return seed({
    eventsData,
    citiesData,
    usersData,
    categoriesData,
    attendeesData,
  });
});
afterAll(() => {
  return db.end();
});

describe("GET:/api", () => {
  test("200 - responds with an object containing all available endpoints", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        expect(body.endpoints).toEqual(endpoints);
      });
  });
  test("404 - returns 404 if endpoint does not exist", () => {
    return request(app)
      .get("/api/cites")
      .expect(404)
      .then(({ res }) => {
        expect(res.statusMessage).toBe("Not Found");
      });
  });
});

describe("/api/cities", () => {
  describe("GET", () => {
    describe("/api/cities", () => {
      test("200 - sendds a list of cities to the client", () => {
        return request(app)
          .get("/api/cities")
          .expect(200)
          .then(({ body }) => {
            expect(body.cities.length).toBe(3);
            expect;
            body.cities.forEach((city) => {
              expect(typeof city.city_name).toBe("string");
            });
          });
      });
    });
  });
});

describe("/api/events", () => {
  describe("GET", () => {
    describe("/api/events", () => {
      test("200 - sends a list of events to the client", () => {
        return request(app)
          .get("/api/events")
          .expect(200)
          .then(({ body }) => {
            expect(body.events.length).toBe(10);
            expect(
              body.events.forEach((event) => {
                expect(event).toMatchObject({
                  event_id: expect.any(Number),
                  city_id: expect.any(Number),
                  city_name: expect.any(String),
                  title: expect.any(String),
                  category_id: expect.any(Number),
                  category_name: expect.any(String),
                  date: expect.any(String),
                  postcode: expect.any(String),
                  description: expect.any(String),
                  attendees: expect.any(Array),
                });
              })
            );
          });
      });
      test('200 - events should be ordered by date "ASC" by default', () => {
        return request(app)
          .get("/api/events")
          .expect(200)
          .then(({ body }) => {
            expect(body.events).toBeSortedBy("date", {
              ascending: true,
            });
          });
      });
      test('200 - events can be sorted by date "DESC" using a query', () => {
        return request(app)
          .get("/api/events?order=desc")
          .expect(200)
          .then(({ body }) => {
            expect(body.events).toBeSortedBy("date", {
              descending: true,
            });
          });
      });
      test("400 - responds with 400 if order is invalid", () => {
        return request(app)
          .get("/api/events?order=ascc")
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe("bad request");
          });
      });
      test("200 - events can be filtered by city_id", () => {
        return request(app)
          .get("/api/events?city=1")
          .expect(200)
          .then(({ body }) => {
            expect(body.events.length).toBe(4);
            expect(
              body.events.forEach((event) => {
                expect(event.city_id).toBe(1);
              })
            );
          });
      });
      test("404 - responds with 404 if city_id does not exist", () => {
        return request(app)
          .get("/api/events?city=4")
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toBe("Not Found");
          });
      });
      test("200 - events can be filtered by category_id", () => {
        return request(app)
          .get("/api/events?category=1")
          .expect(200)
          .then(({ body }) => {
            expect(body.events.length).toBe(2);
            expect(
              body.events.forEach((event) => {
                expect(event.category_id).toBe(1);
              })
            );
          });
      });
      test("404 - responds with 404 if category_id does not exist", () => {
        return request(app)
          .get("/api/events?category=8")
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toBe("Not Found");
          });
      });
    });
    describe("/api/events/:event_id", () => {
      test("200 - sends a single event to the client when a correct id is provided", () => {
        return request(app)
          .get("/api/events/1")
          .expect(200)
          .then(({ body }) => {
            expect(body.event).toMatchObject({
              event_id: 1,
              city_id: 1,
              title: "Community Garden Restoration",
              category_id: 2,
              date: "2024-12-15T00:00:00.000Z",
              postcode: "LS1 4HT",
              description:
                "Help us restore a local community garden by planting flowers and clearing overgrown areas.",
            });
          });
      });
      test("404 - responds with 404 if event_id does not exist", () => {
        return request(app)
          .get("/api/events/200")
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toBe("Event does not exist");
          });
      });
    });
    describe("/api/events/:event_id/attendees", () => {
      test("200 - sends a list of attendees for an event when a correct id is provided", () => {
        return request(app)
          .get("/api/events/1/attendees")
          .expect(200)
          .then(({ body }) => {
            expect(body.attendees).toHaveLength(6);
          });
      });
      test("404 - responds with 404 if event_id does not exist", () => {
        return request(app)
          .get("/api/events/200/attendees")
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toBe("Event does not exist");
          });
      });
    });
  });
  describe("POST", () => {
    describe("api/events", () => {
      test("200 - posts new event when correct information is provided", () => {
        return request(app)
          .post("/api/events")
          .send({
            city_id: 2,
            title: "Litter picking at the community garden",
            category_id: 1,
            date: "2025-04-17",
            postcode: "LS5 3JF",
            description:
              "Another fun litter picking excursion at our local community garden, there will be pizza afterwards.",
          })
          .expect(200)
          .then(({ body }) => {
            expect(body.newEvent).toMatchObject({
              event_id: expect.any(Number),
              city_id: expect.any(Number),
              title: expect.any(String),
              category_id: expect.any(Number),
              date: expect.any(String),
              postcode: expect.any(String),
              description: expect.any(String),
            });
          });
      });
      test("400 - responds with bad reqest if request body is not formatted correctly", () => {
        return request(app)
          .post("/api/events")
          .send({
            event_id: "Hello",
            city_id: "Howdy",
            title: 1,
            category_id: "four",
            date: "2022-10-13",
            postcode: "Merry Xmas",
            description: null,
          })
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe("Invalid id type");
          });
      });
    });
    describe("/api/events/:event_id/attendees", () => {
      test("201 - adds attendee to event when correct user_id and event_id are provided", () => {
        return request(app)
          .post("/api/events/1/attendees")
          .send({ user_id: 1 })
          .expect(201)
          .then(({ body }) => {
            expect(body.msg).toBe("Attendee added successfully");
          });
      });
      test("404 - returns 404 if user_id does not exist", () => {
        return request(app)
          .post("/api/events/1/attendees")
          .send({ user_id: 100 })
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toBe("User does not exist");
          });
      });
      test("404 - returns 404 if event_id does not exist", () => {
        return request(app)
          .post("/api/events/100/attendees")
          .send({ user_id: 1 })
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toBe("Event does not exist");
          });
      });
      test("200 - responds with 200 if user is already attending the event", () => {
        return request(app)
          .post("/api/events/1/attendees")
          .send({ user_id: 2 })
          .expect(200)
          .then(({ body }) => {
            expect(body.msg).toBe("User is already attending");
          });
      });
    });
  });
  describe("DELETE", () => {
    describe("api/events/:event_id", () => {
      test("204 - deletes event when provided with valid id", () => {
        return request(app)
          .delete("/api/events/1")
          .expect(204)
          .then(({ res }) => {
            expect(res.statusMessage).toBe("No Content");
          });
      });
      test('404 - responds with 404 "Not found" when given a valid id that is not present', () => {
        return request(app)
          .delete("/api/events/100")
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toBe("Event does not exist");
          });
      });
    });
    describe("api/events/:event_id/attendees", () => {
      test("204 - deletes attendee from event if they are attending", () => {
        return request(app)
          .delete("/api/events/1/attendees")
          .send({ user_id: 2 })
          .expect(204)
          .then(({ res }) => {
            expect(res.statusMessage).toBe("No Content");
          });
      });
      test("404 - responds with 400 if user is already absent from the event", () => {
        return request(app)
          .delete("/api/events/1/attendees")
          .send({ user_id: 1 })
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toBe("Attendee not found for this event");
          });
      });
    });
  });
});

describe("/api/users", () => {
  describe("GET", () => {
    describe("/api/users", () => {
      test("200 - sends a list of users to the client", () => {
        return request(app)
          .get("/api/users")
          .expect(200)
          .then(({ body }) => {
            expect(body.users.length).toBe(10);
            expect;
            body.users.forEach((user) => {
              expect(typeof user.user_name).toBe("string");
              expect(typeof user.is_admin).toBe("boolean");
            });
          });
      });
    });
    describe("/api/users/:user_id", () => {
      test("200 - sends a single user to the client when a correct id is provided", () => {
        return request(app)
          .get("/api/users/1")
          .expect(200)
          .then(({ body }) => {
            expect(body.user.user_name).toBe("Homer Simpson");
          });
      });
      test("404 - responds with 404 if user_id is not found", () => {
        return request(app)
          .get("/api/users/100")
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toBe("User does not exist");
          });
      });
    });
    describe("/api/users/:user_id/events", () => {
      test("200 - sends a list of events that a user is attending", () => {
        return request(app)
          .get("/api/users/1/events")
          .expect(200)
          .then(({ body }) => {
            expect(body.events).toHaveLength(4);
          });
      });
      test("404 - responds with 404 if user_id is not found", () => {
        return request(app)
          .get("/api/users/100/events")
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toBe("User does not exist");
          });
      });
    });
  });
  describe("POST", () => {
    describe("api/users", () => {
      test("200 - creates a new user when the correct information is provided", () => {
        return request(app)
          .post("/api/users")
          .send({
            user_name: "Apu Nahasapeemapetilon",
            avatar:
              "https://static.wikia.nocookie.net/simpsons/images/6/6e/Profile_-_Apu_Nahasapeemapetilon.png/revision/latest?cb=20250307004048",
            email: "apu.nahasa.com",
            password: "thankyoucomeagain",
            is_admin: false,
          })
          .expect(200)
          .then(({ body }) => {
            expect(body.newUser).toMatchObject({
              user_name: expect.any(String),
              avatar: expect.any(String),
              email: expect.any(String),
              password: expect.any(String),
              is_admin: expect.any(Boolean),
            });
          });
      });
      test("400 - returns 400 bad request if request body is not formatted correctly", () => {
        return request(app)
          .post("/api/users")
          .send({
            user_name: "Apu Nahasapeemapetilon",
            avatar:
              "https://static.wikia.nocookie.net/simpsons/images/6/6e/Profile_-_Apu_Nahasapeemapetilon.png/revision/latest?cb=20250307004048",
            email: "apu.nahasa.com",
            password: 1234,
            is_admin: "Hello",
          })
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe("Invalid id type");
          });
      });
    });
  });
  describe("DELETE", () => {
    describe("/api/users/:user_id", () => {
      test("204 - deletes user when valid user_id is provided", () => {
        return request(app)
          .delete("/api/users/1")
          .expect(204)
          .then(({ res }) => {
            expect(res.statusMessage).toBe("No Content");
          });
      });
      test('404 - responds with 404 "Not found" when given a valid id that is not present', () => {
        return request(app)
          .delete("/api/users/999")
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toBe("User does not exist");
          });
      });
    });
  });
});

describe("/api/categories", () => {
  describe("GET", () => {
    describe("/api/categories", () => {
      test("200 - sends a list of categories to the client", () => {
        return request(app)
          .get("/api/categories")
          .expect(200)
          .then(({ body }) => {
            expect(body.categories.length).toBe(7);
            expect;
            body.categories.forEach((category) => {
              expect(typeof category.category_name).toBe("string");
            });
          });
      });
    });
    describe("/api/categories/:category_id", () => {
      test("200 - sends a single category to the client when a correct id is provided", () => {
        return request(app)
          .get("/api/categories/1")
          .expect(200)
          .then(({ body }) => {
            expect(body.category.category_name).toBe("Litter Picking");
            expect(typeof body.category.category_img).toBe("string");
          });
      });
      test("404 - returns 404 when category_id does not exist", () => {
        return request(app)
          .get("/api/categories/100")
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toBe("Category does not exist");
          });
      });
    });
  });
});
