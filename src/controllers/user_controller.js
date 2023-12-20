// user_controller.js
import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res) => {
    console.log("bye")
    res.status(200).json({
        message: "ok"
    });
});

export { registerUser };
