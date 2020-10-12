import request from "supertest";
import { apiRoot } from "../../config";
import express from "../../services/express";
import Storage from "../../services/storage";
import routes from ".";

const app = () => express(apiRoot, routes);

const testMessageBody = { testKey: "Test value" };

beforeEach(() => {
  Storage.restart();
});

test("POST /messages 201", async () => {
  const { status, body: message } = await request(app())
    .post(`${apiRoot}`)
    .send(testMessageBody);

  expect(status).toBe(201);
  expect(typeof message).toEqual("object");
  expect(message.body).toEqual(testMessageBody);
});

test("GET /messages 200 empty", async () => {
  const { status, body } = await request(app()).get(`${apiRoot}`);

  expect(status).toBe(200);
  expect(Array.isArray(body)).toBe(true);
  expect(body.length).toBe(0);
});

test("GET /messages 200 with messages", async () => {
  await request(app()).post(`${apiRoot}`).send(testMessageBody);
  await request(app()).post(`${apiRoot}`).send(testMessageBody);
  await request(app()).post(`${apiRoot}`).send(testMessageBody);

  const { status, body } = await request(app()).get(`${apiRoot}`);

  expect(status).toBe(200);
  expect(Array.isArray(body)).toBe(true);
  expect(body.length).toBe(3);
  expect(body[0].id).toBe(1);
  expect(body[1].id).toBe(2);
  expect(body[2].id).toBe(3);
});
