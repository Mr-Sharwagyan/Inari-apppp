import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: String,
    description: String,

    type: {
      type: String,
      enum: ["bazaar", "hot_sale", "festival", "flash_sale"],
      default: "bazaar",
    },

    location: String,

    startDate: Date,
    endDate: Date,

    bannerImage: String,

    isActive: {
      type: Boolean,
      default: true,
    },

    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);