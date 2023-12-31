// user_controller.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse  } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"


const generateAccessandRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false})

        return {accessToken,refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token")
    }
}


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


const loginUser = asyncHandler(async (req, res) => {
    // req.body -> data
    // username or email
    // find the user
    // check password
    // generate access and refresh token
    // send cookie

    const {username,email,password} = req.body

    if(!username && !email){
        throw new ApiError(400,"Username or email is required")
    }
    if(!password){
        throw new ApiError(400,"Password is required")
    }


    const user = await User.findOne({
        $or: [{username},{email}]
    })

    if(!user){
        throw new ApiError(404,"User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401,"Invalid user credentials!!")
    }

    const {accessToken, refreshToken} = await generateAccessandRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(200,
            {
                user: 
                    loggedInUser,
                    accessToken,
                    refreshToken
            },
            "User Logged in Successfully")
    )
})

const logoutUser = asyncHandler( async(req, res) => {
    
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logged out"))
})

const refreshAccessToken = asyncHandler( async(req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken
    
    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401,"Invalid Refresh Token")
        }
    
        if(incomingRefreshToken !== user.refreshToken){
            throw new ApiError(401,"Refresh Token expired or used")
        }
    
        const {accessToken, newRefreshToken} = await generateAccessandRefreshToken(user._id)
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken},
                "Access Token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
};
