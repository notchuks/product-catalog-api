import { DocumentDefinition, FilterQuery, UpdateQuery, QueryOptions } from "mongoose";
import { omit } from "lodash";
import * as dotenv from "dotenv";
import path from "path";
import qs from "qs";

import UserModel, { UserDocument, UserInput } from "../models/user.model";
import axios from "axios";
import logger from "../utils/logger";

dotenv.config({ path: path.join(__dirname, "..", "..", "env") });

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_OAUTH_REDIRECT_URL,
} = process.env;

interface GoogleTokensResult {
  access_token: string;
  exprires_in: Number,
  refresh_token: string;
  scope: string;
  id_token: string;
}

interface GoogleUserResult {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

export async function createUser(input: DocumentDefinition<UserInput>) { // Used "Omit<UserDocument, "createdAt" | "updatedAt" | "comparePassword">" because createdAt & updatedAt are automatically generated so dont need to be passed into this function type
  try {
    const user =  await UserModel.create(input);
    return omit(user.toJSON(), "password");
  } catch (e: any) {
    throw new Error(e);
  }
}

export async function validatePassword({ email, password, }: { email: string; password: string; }): Promise<any> {
  const user = await UserModel.findOne({ email });

  if(!user) {
    return false;
  }

  const isValid = await user.comparePassword(password);

  if(!isValid) return false;

  return omit(user.toJSON(), "password");
}

export async function findUser(query: FilterQuery<UserDocument>) {
  return await UserModel.findOne(query).lean();
}

export async function getGoogleOAuthTokens({ code }: { code: string }): Promise<GoogleTokensResult> {
  const url = "https://oauth2.googleapis.com/token";

  const values = {
    code,
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uri: GOOGLE_OAUTH_REDIRECT_URL,
    grant_type: "authorization_code",
  };

  try {
    const res = await axios.post<GoogleTokensResult>(url, qs.stringify(values), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      }
    })

    return res.data;
  } catch (error: any) {
    console.error(error);
    logger.error(error, "Failed to fetch Google OAuth tokens");
    throw new Error(error.message);
  }

}

export async function getGoogleUser({ id_token, access_token }: { id_token: string, access_token: string }): Promise<GoogleUserResult> {
  try {
    const res = await axios.get<GoogleUserResult>(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`, {
      headers: {
        Authorization: `Bearer ${id_token}`
      }
    });

    return res.data;
  } catch (error: any) {
    logger.error(error, "Error fetching user");
    throw new Error(error.message);
  }
}

export async function findAndUpdateUser(query: FilterQuery<UserDocument>, update: UpdateQuery<UserDocument>, options: QueryOptions = {}) {
  return UserModel.findOneAndUpdate(query, update, options);
}