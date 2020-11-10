const { app } = require("../src/app.js");
const config = require("../src/config");

describe("App", () => {
  it("GET / responds with 200 containing 'You've reached the Collab API'", () => {
    return supertest(app)
      .get("/")
      .set("api-key", config.WEDO_API_KEY)
      .expect(200, `You've reached the Collab API`);
  });
});
