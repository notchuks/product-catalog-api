import { DocumentDefinition, FilterQuery, QueryOptions, UpdateQuery } from "mongoose";
import ProductModel, { ProductDocument, ProductInput } from "../models/product.model";
import { databaseResponseTimeHistogram } from "../utils/metrics";

export async function createProduct(input: DocumentDefinition<ProductInput>) {

  // measure response time for creating a user.
  const metricsLabels = {
    operation: "CreateProduct",
  };

  const timer = databaseResponseTimeHistogram.startTimer();
  try {
    const result = await ProductModel.create(input);
    timer({ ...metricsLabels, success: "true" });
    return result;
  } catch (error) {
    timer({ ...metricsLabels, success: "false" });
    throw error;
  }
}

export async function findProduct(query: FilterQuery<ProductDocument>, options: QueryOptions = { lean: true }){
  // measure response time for finding a user.
  const metricsLabels = {
    operation: "FindProduct",
  };

  const timer = databaseResponseTimeHistogram.startTimer();
  try {
    const result = await ProductModel.findOne(query, {}, options);
    timer({ ...metricsLabels, success: "true" });
    return result;
  } catch (error) {
    timer({ ...metricsLabels, success: "false" });
    throw error;
  }
}

export async function findAndUpdateProduct(
  query: FilterQuery<ProductDocument>,
  update: UpdateQuery<ProductDocument>,
  options: QueryOptions
) {
  return ProductModel.findOneAndUpdate(query, update, options);
}

export async function deleteProduct(query: FilterQuery<ProductDocument>) {
  return ProductModel.deleteOne(query);
}
