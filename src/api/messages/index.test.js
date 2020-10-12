import request from "supertest";
import { apiRoot, messageConfirmationWaiting } from "../../config";
import express from "../../services/express";
import Storage from "../../services/storage";
import routes from ".";

const app = () => express(apiRoot, routes);

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

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

test("GET /messages 200 with messages, dont consume same messages twice", async () => {
  await request(app()).post(`${apiRoot}`).send(testMessageBody);
  await request(app()).post(`${apiRoot}`).send(testMessageBody);
  await request(app()).post(`${apiRoot}`).send(testMessageBody);

  let { status, body } = await request(app()).get(`${apiRoot}`);

  expect(status).toBe(200);
  expect(Array.isArray(body)).toBe(true);
  expect(body.length).toBe(3);
  expect(body[0].id).toBe(1);
  expect(body[1].id).toBe(2);
  expect(body[2].id).toBe(3);

  ({ status, body } = await request(app()).get(`${apiRoot}`));
  expect(body.length).toBe(0);
});

test("GET /messages 200 with messages, messages restored after no confirmation", async () => {
  await request(app()).post(`${apiRoot}`).send(testMessageBody);
  await request(app()).post(`${apiRoot}`).send(testMessageBody);
  await request(app()).post(`${apiRoot}`).send(testMessageBody);

  let { status, body } = await request(app()).get(`${apiRoot}`);

  expect(status).toBe(200);
  expect(Array.isArray(body)).toBe(true);
  expect(body.length).toBe(3);
  expect(body[0].id).toBe(1);
  expect(body[1].id).toBe(2);
  expect(body[2].id).toBe(3);

  await sleep(messageConfirmationWaiting * 1000 * 1.5); // Wait a 50% more of the necessary amount of time to be sure the message was restored
  Storage.restoreUnconfirmed();

  ({ status, body } = await request(app()).get(`${apiRoot}`));
  expect(body.length).toBe(3);
  expect(body[0].id).toBe(1);
  expect(body[1].id).toBe(2);
  expect(body[2].id).toBe(3);
});

test("PUT /messages 200", async () => {
  await request(app()).post(`${apiRoot}`).send(testMessageBody);

  const {
    body: [firstMessage],
  } = await request(app()).get(`${apiRoot}`);

  const { id: firstMessageId } = firstMessage;

  const { status, body: message } = await request(app())
    .put(`${apiRoot}/${firstMessageId}`)
    .send(testMessageBody);

  expect(status).toBe(200);
  expect(message).toEqual(firstMessage);
});

test("PUT /messages 404", async () => {
  const nonExistentMessageId = 999;

  const { status } = await request(app())
    .put(`${apiRoot}/${nonExistentMessageId}`)
    .send(testMessageBody);

  expect(status).toBe(404);
});

test("PUT /messages dont confirm same message twice", async () => {
  await request(app()).post(`${apiRoot}`).send(testMessageBody);

  const {
    body: [firstMessage],
  } = await request(app()).get(`${apiRoot}`);

  const { id: firstMessageId } = firstMessage;

  let { status, body: message } = await request(app())
    .put(`${apiRoot}/${firstMessageId}`)
    .send(testMessageBody);

  expect(status).toBe(200);
  expect(message).toEqual(firstMessage);

  ({ status, body: message } = await request(app())
    .put(`${apiRoot}/${firstMessageId}`)
    .send(testMessageBody));

  expect(status).toBe(404);
});
