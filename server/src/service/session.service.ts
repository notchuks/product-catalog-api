import { FilterQuery, UpdateQuery } from "mongoose";
import { get } from "lodash";
import config from "config";
import SessionModel, { SessionDocument } from "../models/session.model"
import { signJwt, verifyJwt } from "../utils/jwt.utils";
import { findUser } from "./user.service";

export async function createSession(userId: string, userAgent: string) {
  const session = await SessionModel.create({ user: userId, userAgent });

  return session.toJSON();
}

export async function findSessions(query: FilterQuery<SessionDocument>) {
  return SessionModel.find(query).lean();
}

export async function updateSession(query: FilterQuery<SessionDocument>, update: UpdateQuery<SessionDocument>) {
  return SessionModel.updateOne(query, update);
}

export async function reIssueAccessToken({ refreshToken, }: { refreshToken: string; }) { // Here we want to reissue a new accessToken to the user (so they can login) when the previous has expired (after 15 mins) IF their refreshToken is still valid(1 yr validity period) and {valid: true} on the session object (i.e the user hasn't logged out).
  const { decoded } = verifyJwt(refreshToken);

  // if no user object or session id is returned from verifyJwt return false
  if(!decoded || !get(decoded, "session")) return false;

  // use sessionId to find session object refer createUserSessionHandler in session.conroller & verifyJwt for more info.
  const session = await SessionModel.findById(get(decoded, "session"));

  if(!session || !session.valid) return false;

  const user = await findUser({ _id: session.user });

  if(!user) return false;

  // Create a new accessToken
  const accessToken = signJwt(
    { ...user, session: session._id },
    { expiresIn: config.get("accessTokenTtl") }
  );

  return accessToken;
} 