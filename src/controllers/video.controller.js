import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  const pipeline = [
    // Filter by userId (optional)
    {
      $match: {
        userId: { $eq: userId }, // Replace with actual userId if needed
      },
    },
    // Text search based on query (optional)
    {
      $match: {
        $text: { $search: query }, // Replace with actual query string if needed
      },
    },
    // Sorting based on sortBy and sortType
    {
      $sort: {
        [sortBy]: sortType === "asc" ? 1 : -1,
      },
    },
    // Pagination - Skip and Limit
    {
      $skip: (page - 1) * limit, // Offset for pagination
    },
    {
      $limit: limit, // Number of documents to return
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "owner",
        as: "owner",
        pipeline: [
          {
            $project: {
              fullName: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
  ];

  try {
    const videos = await Video.collection("videos").aggregate(pipeline);
    return res
      .status(200)
      .json(new ApiResponse(200, videos, "Videos fetched successfully!"));
  } catch (error) {
    return new ApiError(404, "Error while fetching videos!");
  }
});

const publishAVideo = asyncHandler(async (req, res) => {
  // TODO: get video, upload to cloudinary, create video
  if (Object.keys(req.body).length === 0) {
    throw new ApiError(400, "No data provided");
  }

  const { title, description } = req.body;
  if ([title, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required!");
  }

  // handling files
  const videoLocalFile = req.files?.videoFile[0]?.path;
  const thumbLocalPath = req.files?.thumbnail[0]?.path;

  if (!videoLocalFile || !thumbLocalPath) {
    throw new ApiError(400, "No files provided");
  }

  const videoFile = await uploadOnCloudinary(videoLocalFile);
  const thumbnail = await uploadOnCloudinary(thumbLocalPath);

  if (!videoFile || !thumbnail) {
    throw new ApiError(400, "Error while uploading video");
  }

  const video = await Video.create({
    title,
    description,
    thumbnail: thumbnail.url,
    videoFile: videoFile.url,
    duration: videoFile.duration,
    views: 0,
    isPublished: "true",
    owner: req.user._id,
  });

  if (!video) {
    throw new ApiError(400, "Error while creating video");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, video, "Video created successfully!"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
