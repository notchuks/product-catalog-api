import mongoose from "mongoose";
import bcrypt from "bcrypt";
import config from "config";

// createdAt, updatedAt are not in user body in request. So an error is generated when using UserDocument interface as the type of the parameter of createUser functions. This is a nice workaround to use this interface in such functions
export interface UserInput {
  email: string;
  name: string;
  password: string;
  picture?: string;
}

// He used UserDocument in tutorial.
export interface UserDocument extends UserInput, mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<Boolean>;
}

// Mongoose used to define this before mongoose 6. For backwards compatibility we will now just redefine it ourselves.
// export interface HookNextFunction {
//   // eslint-disable-next-line @typescript-eslint/no-explicit any
//   (error?: Error): any
// }

const userSchema = new mongoose.Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    picture: { type: String },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  let user = this as UserDocument;

  if (!user.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(config.get<number>('saltWorkFactor'));

  const hash = await bcrypt.hashSync(user.password, salt);

  user.password = hash;

  return next();
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> { // add this: UserDocument, to parameters
  const user = this as UserDocument;

  return bcrypt.compare(candidatePassword, user.password).catch((e) => false);
}

const UserModel = mongoose.model<UserDocument>("User", userSchema);
export default UserModel;