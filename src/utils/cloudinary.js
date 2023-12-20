import { v2 as cloudinary } from "cloudinary"
import fs from "fs"




cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


    const uploadOnCloudinary = async (localFilePath) => {
        try {
            // console.log("entered try")
            if (!localFilePath) return null;
            // upload the file on cloudinary
            // console.log("Start uploading")
            const response = await cloudinary.uploader.upload(localFilePath, {
                resource_type: "auto"
            })
            //file has been uploaded successfully
            // console.log("File is uploaded on cloudinary", response.url);
            fs.unlinkSync(localFilePath)
            return response
        }catch (error) {
            console.error(error.message)
            // console.log("Error in file uploading")
            fs.unlinkSync(localFilePath)     //remove the locally saved temporary file as the upload operation failed
            return null
        }
    }


export {uploadOnCloudinary}




// cloudinary.v2.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//     { public_id: "olympic_flag" },
//     function (error, result) { console.log(result); });