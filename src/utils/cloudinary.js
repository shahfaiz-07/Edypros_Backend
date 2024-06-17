import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      asset_folder: 'Edypros',
      resource_type: "auto",
    });
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
  }
};

const removeFromCloudinary = async (cloudFileUrl, resourceType = "image") => {
  if (!cloudFileUrl) return null;
  await cloudinary.uploader
    .destroy(cloudFileUrl.substring(cloudFileUrl.lastIndexOf("/")+1, cloudFileUrl.lastIndexOf(".")), {
        asset_folder: 'Edypros',
      resource_type: resourceType,
    })
    .then((result) => console.log(result))
    .catch((error) =>
      console.log("ERROR while removing file from cloudinary : ", error)
    );
};

export { uploadOnCloudinary, removeFromCloudinary};
