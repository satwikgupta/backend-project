import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId, // one who is subscribing
      ref: "User",
    },
    channel: {
      type: Schema.Types.ObjectId, // channel to subscribe to
      ref: "User",
    },
  },
  { timeseries: true }
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
