import request from "supertest";
import { apiRoot } from "../../config";
import express from "../../services/express";
import routes from ".";

const app = () => express(apiRoot, routes);

test("POST /messages 201", async () => {
  const messageToInsert = { testKey: "Test value" };

  const { status, body: message } = await request(app())
    .post(`${apiRoot}`)
    .send(messageToInsert);

  expect(status).toBe(201);
  expect(typeof message).toEqual("object");
  expect(message.body).toEqual(messageToInsert);
});

test("GET /messages 200", async () => {
  const { status, body } = await request(app()).get(`${apiRoot}`);
  expect(status).toBe(200);
  expect(Array.isArray(body)).toBe(true);
});
