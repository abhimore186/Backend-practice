// user_controller.js
import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse  } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    // console.log("bye")
    // console.log(req.headers)
    // console.log("\n",req.body)
    // res.cookie('username', 'john_doe', { maxAge: 900000, httpOnly: true })
    // res.status(200).json({
    //     message: "ok"
    // });

    // Steps for registering a user
    // 1) Get user details from frontend
    // 2) Validation of the details   - not empty
    // 3) Check if user aleardy exists: check username or email
    // 4) Check for images, check for avatar
    // 5) Upload them to cloudinary, avatar
    // 6) Create user object - create entry in db
    // 7) Remove password and refresh token field from response
    // 8) Check for user creation
    // 9) return res

    // 1) Get user details from frontend
    const {username, email, fullName,password} = req.body
    console.log("Name: ",fullName);
    // res.status(200).send(`Hi, ${fullName}`)

    // 2) Validation of the details   - not empty
    if(
        [fullName,username,password,email].some((field)=> 
        field?.trim === "")
    ){
        throw new ApiError(400,"All fields are required!")
    }

    if (!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
        throw new ApiError(400, "Invalid Email!! Enter a valid email address for eg: abc@gmail.com");
    }

    // 3) Check if user aleardy exists: check username or email
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    // console.log(existedUser)

    if(existedUser){
        throw new ApiError(409," User with email or username already exits!")
    }

    // console.log(req.files);
    // 4) Check for images, check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // console.log(avatarLocalPath)
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }

    // 5) Upload them to cloudinary, avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    // console.log(avatar)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(409, "Avatar file is required on cloudinary")
    }

    // 6) Create user object - create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    // 7) Remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // 8) Check for user creation in the database
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
    }


    // 9) return res
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Created Successfully!")
    )





    // res.status(200).send("Successfully registered")
    // console.log("Finished!");
});

export { registerUser };
