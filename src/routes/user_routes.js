// user_routes.js
import { Router } from "express";
import { 
        loginUser, 
        logoutUser, 
        registerUser, 
        refreshAccessToken, 
        changeCurrentPassword, 
        getCurrentUser, 
        updateAccountDetails, 
        updateUserAvatar, 
        updateUserCoverImage, 
        getUserChannelProfile, 
        getWatchHistory 
    } from "../controllers/user_controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJwt } from "../middlewares/auth.middleware.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const userRouter = Router();

userRouter.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    )

userRouter.route("/login").post(loginUser)

//secured routes
userRouter.route("/logout").post(verifyJwt, logoutUser)
userRouter.route("/refresh-token").post(refreshAccessToken)
userRouter.route("/change-password").post(verifyJwt,changeCurrentPassword)
userRouter.route("/current-user").get(verifyJwt,getCurrentUser)
userRouter.route("/update-account-details").patch(verifyJwt,updateAccountDetails)

userRouter.route("/update-avatar").patch(verifyJwt,upload.single("avatar"),updateUserAvatar)

userRouter.route("/update-coverImage").patch(verifyJwt,upload.single("coverImage"),updateUserCoverImage)


userRouter.route("/c/:username").get(verifyJwt,getUserChannelProfile)

userRouter.route("/history").get(verifyJwt,getWatchHistory)

export default userRouter;
