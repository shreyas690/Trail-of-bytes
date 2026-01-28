import request from "supertest";
import app from "../src/app.js";
import Team from "../src/models/Team.js";

describe("Team login", () => {
  beforeEach(async () => {
    await Team.deleteMany({});
  });

  it("creates team when first login", async () => {
    const res = await request(app).post("/api/auth/team-login").send({
      name: "Alpha",
      code: "alpha-1"
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.team.name).toBe("Alpha");
  });
});

