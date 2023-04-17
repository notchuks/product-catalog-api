import * as UserService from "../service/user.service";
import * as SessionService from "../service/session.service";
import mongoose from "mongoose";
import supertest from "supertest";
import createServer from "../utils/server";
import { createUserSessionHandler } from "../controller/session.controller";

const app = createServer();

const userId = new mongoose.Types.ObjectId().toString();

const userPayload = {
  user: userId,
  email: "jane.doe@example.com",
  name: "Jane Doe"
}

const userInput = {
  email: "test@example.com",
  name: "Jane Doe",
  password: "Password123",
  passwordConfirmation: "Password123"
};

const sessionPayload = {
  _id: new mongoose.Types.ObjectId().toString(),
  user: userId,
  valid: true,
  userAgent: "PostmanRuntime/7.28.0",
  createdAt: new Date("2023-03-13T14:23:51.350+00:00"),
  updatedAt: new Date("2023-03-13T14:23:51.350+00:00"),
  __v: 0,
};

describe("user", () => {
  // User registration
  describe("user registration", () => {
    // the username & password get validated
    describe("given the username and password are valid", () => {
      it("should return the user payload", async () => {
        // @ts-ignore
        const createUserServiceMock = jest.spyOn(UserService, "createUser").mockReturnValueOnce(userPayload);
        // const createUserServiceMock = UserService.createUser(userInput);

        // const { statusCode, body } = await supertest(app).post("/api/users").send(userInput);
        const { statusCode, body } = await supertest(app).post("/api/users").send(userInput);

        expect(statusCode).toBe(200);
        expect(body).toEqual(userPayload);
        expect(createUserServiceMock).toHaveBeenCalledWith(userInput);
      })
    })

    // verify that the passwords match
    describe("given the passwords do not match", () => {
      it("should return a 400", async () => {
        // @ts-ignore
        const createUserServiceMock = jest.spyOn(UserService, "createUser").mockReturnValueOnce(userPayload);
        // const createUserServiceMock = UserService.createUser(userInput);

        // const { statusCode, body } = await supertest(app).post("/api/users").send(userInput);
        const { statusCode } = await supertest(app).post("/api/users").send({ ...userInput, passwordConfirmation: "doesnotmatch" });

        expect(statusCode).toBe(400);
        expect(createUserServiceMock).not.toHaveBeenCalled();
      })
    })

    // verify that the error handler handles any errors
    describe("given the user service throws", () => {
      it("should return a 409 error", async () => {
        // @ts-ignore
        const createUserServiceMock = jest.spyOn(UserService, "createUser").mockRejectedValue("oh no :(")
        // const createUserServiceMock = UserService.createUser(userInput);

        // const { statusCode, body } = await supertest(app).post("/api/users").send(userInput);
        const { statusCode } = await supertest(app).post("/api/users").send(userInput);

        expect(statusCode).toBe(409);
        expect(createUserServiceMock).toHaveBeenCalled();
      })
    })
  })
    
    
  // Creating a user session
  describe("create a user sesssion", () => {
    describe("given the username & password are valid", () => {
      it("should return a signed accessToken & refreshToken", async () => {
        // @ts-ignore
        jest.spyOn(UserService, "validatePassword").mockReturnValue(userPayload);
        // @ts-ignore
        jest.spyOn(SessionService, "createSession").mockReturnValue(sessionPayload);

        const req = {
          get: () => {
            return "a useragent"
          },
          body: {
            email: "test@example.com",
            password: "Password123",
          },
        }

        const send = jest.fn()
        const res = {
          send
        }

        // @ts-ignore
        await createUserSessionHandler(req, res);
        expect(send).toHaveBeenCalledWith({ accessToken: expect.any(String), refreshToken: expect.any(String) });
      });
    });
  });
  
});