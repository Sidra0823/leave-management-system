
import request from "supertest";
import app from "../src/app.js";

describe("Health Check", () => {
  it("GET /health should return ok", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});
