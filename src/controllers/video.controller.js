import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteFileFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sortBy = 'title', sortType, userId = req.user._id } = req.query;
  console.log('limit: ',limit ,  "sortBy: ", sortBy, "sortType: ", sortType, "userId: ", userId);
  
  const pipeline = [
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
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
      $limit: Number(limit), // Number of documents to return
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

  const videos = await Video.aggregate(pipeline);
  if (!videos?.length) { 
    throw new ApiError(404, "No videos found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully!"));
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
  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Video id is required");
  }

  const video = await Video.findById(videoId);

  return res.status(200).json(new ApiResponse(200, video, "Video found!"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail

  const { title, description } = req.body;
  if ([title, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required!");
  }

  const thumbnail = req.file[0]?.path;

  if (!thumbnail) {
    throw new ApiError(400, "No thumbnail provided");
  }

  const video = await Video.findById(videoId);
  const oldThumbnail = video.thumbnail;
  deleteFileFromCloudinary(oldThumbnail);

  const thumbnailUrl = await uploadOnCloudinary(thumbnail);
  if (!thumbnailUrl) {
    throw new ApiError(400, "Error while uploading thumbnail");
  }

  video.title = title;
  video.description = description;
  video.thumbnail = thumbnailUrl.url;

  const updatedVideo = await video.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully!"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted Successfully!"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle publish status

  const video = await Video.findById(videoId);
  video.isPublished = video.isPublished === "true" ? "false" : "true";
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
