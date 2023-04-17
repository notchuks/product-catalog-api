import { Request, Response, CookieOptions } from "express";
import config from "config";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import path from "path";

import { signJwt } from "../utils/jwt.utils";
import { createSession, findSessions, updateSession } from "../service/session.service";
import { findAndUpdateUser, getGoogleOAuthTokens, getGoogleUser, validatePassword } from "../service/user.service"
import logger from "../utils/logger";

dotenv.config({ path: path.join(__dirname, "..", "..", "env") });

const {
  ORIGIN
} = process.env;

const accessTokenCookieOptions: CookieOptions = {
  maxAge: 900000, // 15 mins
  httpOnly: true,
  domain: "localhost",
  path: "/",
  sameSite: "strict",
  secure: false,
};

// They have the same options apart from maxAge
const refreshTokenCookieOptions: CookieOptions = {
  ...accessTokenCookieOptions,
  maxAge: 3.154e10, // 1 year
};

export async function createUserSessionHandler(req: Request, res: Response) {

  // Validate the user's password
  const user = await validatePassword(req.body);

  if(!user) {
    return res.status(401).send("Invalid user credentials");
  }

  // Create a session
  const session = await createSession(user._id, req.get("user-agent") || "");

  // Create an accessToken
  const accessToken = signJwt(
    { ...user, session: session._id },
    { expiresIn: config.get("accessTokenTtl") }
  );

  // Create a refreshToken
  const refreshToken = signJwt(
    { ...user, session: session._id },
    { expiresIn: config.get("refreshTokenTtl") }
  );

  res.cookie("accessToken", accessToken, accessTokenCookieOptions);

  res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

  // Return access & refresh tokens
  return res.send({ accessToken, refreshToken });
}

export async function getUserSessionsHandler(req: Request, res: Response) {
  // user in res.locals is gotten when we deserialize the user object from our accessToken, which we derived when creating a session by signing our user object + our session id. Refer jwt.utils
  const userId = res.locals.user._id;
  // console.log("userId: ", userId);

  const sessions = await findSessions({ user: userId, valid: true });
  // console.log("sessions: ", { sessions });

  return res.send(sessions);
}

export async function deleteUserSessionHandler(req: Request, res: Response) {
  // We assign the decoded object to res.locals.user in deserializeUser(a middleware for all routes). refer above + jwt.utils + deserializeUser for more info.
  const sessionId = res.locals.user.session;

  // set session validity to false instead of deleting it
  await updateSession({ _id: sessionId }, { valid: false });

  // After the above is implemented, the user can still get sessions with that accessToken when using postman because the accessToken is still in the request header in our postman environment variables. But with the response below when using a client, we can set the accessToken to null in subsequent get requests, so that a 403 forbidden error can be returned instead of the user.
  return res.send({
    accessToken: null, 
    refreshToken: null,
  });

}

export async function googleOauthHandler(req: Request, res: Response) {
  try {
    // get the code from qs
    // This "code" is the authorization code returned from the authorization server(google) in that url that redirects to /sessions/oauth/google
    const code = req.query.code as string;

    // get the id and access token with the code
    const { id_token, access_token } = await getGoogleOAuthTokens({ code });
    console.log({ id_token, access_token });

    // get the user with the tokens
    const googleUser = await getGoogleUser({ id_token, access_token }) // jwt.decode(id_token);

    console.log({ googleUser });

    if(!googleUser.verified_email) {
      return res.status(403).send("Google account is not verified");
    }

    // upsert the user (create if not existing before, dont create if existing)
    const user = await findAndUpdateUser({ email: googleUser.email }, { email: googleUser.email, name: googleUser.name, picture: googleUser.picture }, { upsert: true, new: true });

    // create a session
    const session = await createSession(user?._id, req.get("user-agent") || "");

    const userJ = user?.toJSON();

    // create access & refresh tokens
    const accessToken = signJwt(
      { ...userJ, session: session._id },
      { expiresIn: config.get("accessTokenTtl") }
    );
  
    const refreshToken = signJwt(
      { ...userJ, session: session._id },
      { expiresIn: config.get("refreshTokenTtl") }
    );

    // set cookies
    res.cookie("accessToken", accessToken, accessTokenCookieOptions);

    res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

    // redirect back to user
    res.redirect(ORIGIN as string);
  } catch (error) {
    logger.error(error, "Failed to authorize google user");
    return res.redirect(`${ORIGIN}/oauth/error`);
  }

}