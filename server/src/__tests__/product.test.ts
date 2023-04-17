import supertest from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import createServer from "../utils/server";
import mongoose, { mongo } from "mongoose";
import { createProduct } from "../service/product.service";
import { signJwt } from "../utils/jwt.utils";
import * as ProductService from "../service/product.service";

import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "..", "..", "env") });

const app = createServer();

const userId = new mongoose.Types.ObjectId().toString();

export const productPayload = {
  user: userId,
  title: "Canon EOS 1500D DSLR Camera with 18-55mm Lens",
  description:
    `Designed for first-time DSLR owners who want impressive results straight out of the box, capture those 
    magic moments no matter your level with the EOS 1500D. With easy to use automatic shooting modes, large 24.1 MP 
    sensor, Canon Camera Connect app integration and built-in feature guide, EOS 1500D is always ready to go.
    `,
  price: 879.99,
  image: "https://i.imgur.com/QlRphfQ.jpg",
};

export const userPayload = {
  _id: userId,
  email: "jane.doe@example.com",
  name: "Jane Doe",
}

describe("product", () => {
  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    // console.log(mongoServer.getUri());
  });


  afterAll(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
  });

  describe("get product route", () => {
    describe('given the product does not exist', () => {
      it("should return a 404", async () => {
        const productId = "product-123";
        await supertest(app).get(`/api/products/${productId}`).expect(404);
      })
    });

    describe('given the product exists', () => {
      it("should return a 200 status and the product", async () => {
        const product = await createProduct(productPayload);
        const { body, statusCode } = await supertest(app).get(`/api/products/${product.productId}`);

        // Using jest expect
        expect(statusCode).toBe(200);
        expect(body.productId).toBe(product.productId);
      })
    });
  })

  describe("create product route", () => {
    describe("given the user is not logged in", () => {
      it("should return a 403", async () => {
        const { statusCode } = await supertest(app).post(`/api/products`);
        expect(statusCode).toBe(403);
      })
    })

    describe("given the user is logged in", () => {
      it("should return a 200 and create the product", async () => {
        const jwt = signJwt(userPayload);
        // console.log(userPayload);
        // console.log(jwt);
        // console.log(productPayload);

        const { statusCode, body } = await supertest(app).post("/api/products")
        .set("Authorization", `Bearer ${jwt}`)
        .send(productPayload);

        expect(statusCode).toBe(200);

        // expect.any() is used because some values are generated dynamically. used in description also cuz of string literals (``)
        expect(body).toEqual({
          __v: 0,
          _id: expect.any(String),
          createdAt: expect.any(String),
          description: expect.any(String),
          image: "https://i.imgur.com/QlRphfQ.jpg",
          price: 879.99,
          productId: expect.any(String),
          title: "Canon EOS 1500D DSLR Camera with 18-55mm Lens",
          updatedAt: expect.any(String),
          user: expect.any(String),
        });
      })
    })
  })

  describe('test jest fns', () => {
    it("should test jest spyOn", async () => {
      const jwt = signJwt(userPayload);
      // @ts-ignore
      const createProductServiceMock = jest.spyOn(ProductService, "createProduct").mockReturnValueOnce(productPayload);
      const { statusCode, body } = await supertest(app).post("/api/products").send(productPayload)
      .set("Authorization", `Bearer ${jwt}`)
      .send(productPayload);

      expect(statusCode).toBe(200);

      expect(body).toBe(productPayload);
      expect(createProductServiceMock).toHaveBeenCalledWith(productPayload);
    })
  })
})