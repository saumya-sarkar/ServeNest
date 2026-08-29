import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js"


const generateAccessAndRefreshTokens = async(userId) => {
    try {

        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(404, "User not found.");
        }
        
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
        
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens.");
    }
}


const registerUser = asyncHandler(async (req, res) => {
    const { 
            username, 
            fullName, 
            email, 
            phone, 
            password, 
            role = "user",
            addressLine1,
            addressLine2,
            city,
            state,
            pincode 
            // address,
            // address: {addressLine1, addressLine2, city, state, pincode}
        } = req.body;
    console.log("email:", email);

    if (
        [username, fullName, email, password, addressLine1, city, state, pincode].some((field) => field === undefined)
    ) {
        throw new ApiError(400, "All required fields must be provided.");
    }
    if (
        [username, fullName, email, password, addressLine1, city, state, pincode].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All required fields can not be empty.");
    }
    const existingUser = await User.findOne({ 
        $or: [ { email }, { username } ] 
    }); // Returns a promise that resolves to the matched document, or null if no document matches.
    if (existingUser) {
        throw new ApiError(409, "User with given email or username already exists.");
    }

    console.log("req.files:", req.files);
    const profilePictureLocalPath = req.files?.profilePicture?req.files.profilePicture[0].path:"";
    
    let profilePictureUrl;
    
    if (profilePictureLocalPath !== "") {
        const profilePictureResponse = await uploadToCloudinary(profilePictureLocalPath);
        // console.log("profilePictureResponse:", profilePictureResponse);
        profilePictureUrl = profilePictureResponse?.secure_url || null;
    }

    const user = await User.create(
        {
            username,
            fullName,
            email,
            phone: phone?.trim() === "" ? null : phone,
            password,
            profilePicture: profilePictureUrl,
            role,
            address: {
                addressLine1,
                addressLine2: addressLine2?.trim() === "" ? null : addressLine2,
                city,
                state,
                pincode
            }
        }
    );
                                    
    // console.log("New user created:", user);

    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully.")
    );
});

const loginUser = asyncHandler(async(req, res) => {
    const { emailOrUsername, password } = req.body;
    
    if(emailOrUsername === undefined || emailOrUsername.trim() === ""){
        throw new ApiError(400, "Email or Username must be provided.");
    }

    if(password === undefined || password.trim() === ""){
        throw new ApiError(400, "Password must be provided.");
    }

    const user = await User.findOne({
        $or: [{email: emailOrUsername}, {username: emailOrUsername}]
    }).select("-password -refreshToken");

    if(!user){
        throw new ApiError(404, "User does not exist.");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401, "The password you have entered is incorrect.");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const cookieOptions = {
        httpOnly: true,
        secure: true,  // process.env.NODE_ENV === "production"
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days ( in milliseconds )
    };

    return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
        new ApiResponse(200, {
            user: user,
            accessToken,
            refreshToken
        }, "User logged in successfully."   
        )
    );
})

const logoutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(req.user._id, 
        {
            $set: { 
                refreshToken: null 
            }
        },
        {
            new: true,
            runValidators: false
        }
    )

    const cookieOptions = {
        httpOnly: true,
        secure: true,  // process.env.NODE_ENV === "production"
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days ( in milliseconds )
    };

    return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(
        new ApiResponse(200, null, "User logged out successfully.")
    );
})

export { registerUser, loginUser, logoutUser}