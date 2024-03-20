import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

/*
// get user details from frontend
// validation - not empty
// check if user already exists (username + email)
// check for images, avatar
// upload them to cloudinary, avatar
// create user object - create entry on DB
// remove password and refresh_token field from response
// check for user creation
// return response
*/

const registerUser = asyncHandler(async (req, res) => {
  if (Object.keys(req.body).length === 0) {
    throw new ApiError(400, "No data provided");
  }

  console.log("req.body: ", req.body);
  const { fullName, email, username, password } = req.body;

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required!");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if(await User.findOne({fullName})){
    console.log('Fulname Duplicate');
    
  }
  //  console.log(existedUser);

  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }

  // handling files upload
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  let coverImageLocalPath;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Error uploading avatar.");
  }
  // console.log("avatar: ", avatar);

  // creating user in DB
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    username: username.toLowerCase(),
    email,
    password,
  });

  // filtering DB response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Error creating user.");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully!"));
});

export { registerUser };
