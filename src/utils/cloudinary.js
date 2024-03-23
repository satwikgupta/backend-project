import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      // console.log("File not found !");
      return;
    }
    //upload file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    //file has been uploaded successfully
    // console.log("File is uploaded on cloudinary successfully!! ", response.url);

    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    //remove the locally saved temp file as the upload operation got failed.

    fs.unlinkSync(localFilePath);
    return null;
  }
};
//http://res.cloudinary.com/dacndab9l/image/upload/v1711034477/if51vew9qidiamv1bm3q.jpg
const deleteFileFromCloudinary = async (url) => {
  try {
    if (!url) {
      return;
    }
    const regex = /\/upload\/v[0-9]+\/(.+?)\.(jpg|jpeg|png|gif)/;
    const match = url.match(regex);
    const publicId = match ? match[1] : null;
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    return null;
  }
};

export { uploadOnCloudinary, deleteFileFromCloudinary };
