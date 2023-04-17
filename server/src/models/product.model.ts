import mongoose from "mongoose";
import { customAlphabet } from "nanoid";
import { UserDocument } from "./user.model";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 10);

// no need to add productId: string to interface, maybe 'cause its auto generated.
// Samae reason for separation like in user model.
export interface ProductInput {
  user: UserDocument["_id"];
  title: string;
  description: string;
  price: number;
  image: string;
}

// We put the values that are created by default(ie not passed in from the user here so we can use the above interface for validation with zod, and in the createProduct controller) 
export interface ProductDocument extends ProductInput, mongoose.Document {
  productId: string,
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      unique: true,
      default: () => `product_${nanoid()}`,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const ProductModel = mongoose.model<ProductDocument>("Product", productSchema);

export default ProductModel;