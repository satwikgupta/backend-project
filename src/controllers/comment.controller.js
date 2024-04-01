import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const comments = await Comment.find({ video: videoId }).populate(
    "owner",
    "fullName username avatar"
  );

  if (!comments) {
    throw new ApiError(404, "No comments found for this video");
  }

  res.status(200).json(new ApiResponse(200, comments, "Comments found!"));
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  const { content } = req.body;

  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  if (!content || content.trim() === "") {
    throw new ApiError(400, "Comment content is required");
  }

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: req.user._id,
  });

  if (!comment) {
    throw new ApiError(500, "Error while creating comment");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, comment, "Comment created successfully!"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;

  if (!commentId) {
    throw new ApiError(404, "Comment not found");
  }

  const { content } = req.body;

  if (!content || content.trim() === "") {
    throw new ApiError(400, "Comment content is required");
  }

  const comment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content,
      },
    },
    { new: true }
  );

  if (!comment) {
    throw new ApiError(500, "Error while updating comment");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment updated successfully!"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(404, "Comment not found");
  }

  const comment = await Comment.findByIdAndDelete(commentId);
  if (!comment) {
    throw new ApiError(500, "Error while deleting comment");
  }
  return res.status(200).json(new ApiResponse(200, {}, "Comment deleted!"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
