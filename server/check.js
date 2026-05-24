import mongoose from "mongoose";
import Product from "./models/Product.js";

const run = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/inari");

    const product = await Product.findOne({ name: "Organic Sweet Corn" });

    console.log("PRODUCT DATA:");
    console.log(product);

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

run();