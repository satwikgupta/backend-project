import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
  {
    videos: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
    likedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timeseries: true }
);


export const Like = mongoose.model("Like", likeSchema);
