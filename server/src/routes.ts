import { Express, Request, Response } from "express";
import {
  createProductHandler,
  deleteProductHandler,
  getProductHandler,
  updateProductHandler,
} from "./controller/product.controller";
import {
  createUserSessionHandler,
  deleteUserSessionHandler,
  getUserSessionsHandler,
  googleOauthHandler,
} from "./controller/session.controller";
import {
  createUserHandler,
  getCurrentUser,
} from "./controller/user.controller";
import requireUser from "./middleware/requireUser";
import validateResource from "./middleware/validateResource";
import {
  createProductSchema,
  deleteProductSchema,
  getProductSchema,
  updateProductSchema,
} from "./schema/product.schema";
import { createSessionSchema } from "./schema/session.schema";
import { createUserSchema } from "./schema/user.schema";

function routes(app: Express) {
  /**
   * @openapi
   * /proofoflife:
   *   get:
   *     description: Responds if the app is up and running
   *     tags:
   *      - Proofoflife
   *     responses:
   *       200:
   *         description: App is up and running
   */
  app.get("/proofoflife", (req: Request, res: Response) => res.sendStatus(200));

  /**
   * @openapi
   * '/api/users':
   *   post:
   *      tags:
   *        - User
   *      summary: Register a user
   *      requestBody:
   *        required: true
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/CreateUserInput'
   *      responses:
   *        200:
   *          description: Success
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/CreateUserResponse'
   *        409:
   *          description: Conflict
   *        400:
   *          description: Bad Request
   */
  app.post("/api/users", validateResource(createUserSchema), createUserHandler);

  app.get("/api/me", requireUser, getCurrentUser);

  app.post(
    "/api/sessions",
    validateResource(createSessionSchema),
    createUserSessionHandler
  );

  app.get("/api/sessions", requireUser, getUserSessionsHandler);

  app.delete("/api/sessions", requireUser, deleteUserSessionHandler);

  app.get("/api/sessions/oauth/google", googleOauthHandler);

  app.post(
    "/api/products",
    [requireUser, validateResource(createProductSchema)],
    createProductHandler
  );

  app.put(
    "/api/products/:productId",
    [requireUser, validateResource(updateProductSchema)],
    updateProductHandler
  );

  /**
   * @openapi
   * '/api/products/{productId}':
   *   get:
   *     description: Get a single product by the productId
   *     tags:
   *      - Products
   *     parameters:
   *       - name: productId
   *         in: path
   *         description: The id of the product
   *         required: true
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Product'
   *       404:
   *         description: Product not found
   */
  app.get(
    "/api/products/:productId",
    validateResource(getProductSchema),
    getProductHandler
  );

  /**
   * @openapi
   * '/api/products/{productId}':
   *   delete:
   *     description: Deletes a product with the productId
   *     tags:
   *      - Products
   *     parameters:
   *       - name: productId
   *         in: path
   *         description: The id of the product
   *         required: true
   *     responses:
   *       200:
   *         description: Successfully deleted product
   *       404:
   *         description: Product not found
   *       403:
   *         description: Only product creator can delete product
   */
  app.delete(
    "/api/products/:productId",
    [requireUser, validateResource(deleteProductSchema)],
    deleteProductHandler
  );
}

export default routes;
