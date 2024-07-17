const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require("../models/userModel")
const sendToken = require("../utils/jwttoken");
const sendEmail = require("../utils/sendEmail")
const crypto = require("crypto")
const Product = require("../models/productModel");
const cloudinary = require("cloudinary");

exports.registerUser = catchAsyncErrors(async (req, res, next) => {
    if (!req.files || !req.files.avatar) {
        return next(new ErrorHandler('Please upload an avatar', 400));
    }
    const avatarFile = req.files.avatar;

    const myCloud = await cloudinary.v2.uploader.upload(avatarFile.tempFilePath, {
        folder: "Avatars",
        width: 150,
        crop: "scale",
    });

    const { name, email, password } = req.body;
    const user = await User.create({
        name,
        email,
        password,
        avatar: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        }
    })
    sendToken(user, 201, res);
})

exports.loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    // Checking if email and password matchs
    if (!email || !password) {
        return next(new ErrorHandler("Please Enter Email And Password", 400));
    }
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return next(new ErrorHandler("Invalid Email or Password"), 401);
    }
    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid Email or Password"), 401);
    }
    sendToken(user, 200, res);
})

// Logout User

exports.logoutUser = catchAsyncErrors(async (req, res) => {

    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    })

    res.status(200).json({
        success: true,
        message: "Logged Out",
    })
})

// Forget Password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {

    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    // Get ResetPassword Token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const frontendURL = "http://localhost:3000";
    const resetPasswordUrl = `${frontendURL}/password/reset/${resetToken}`;

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;

    try {
        await sendEmail({
            email: user.email,
            subject: `Ecommerce Password Recovery`,
            message,
        });

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`,
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandler(error.message, 500));
    }
});

// Reset Password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    })
    if (!user) {
        return next(new ErrorHandler("Reset Password Token is invalid or has been expired", 404));
    }

    if (req.body.password !== req.body.confirmPassword)
        return next(new ErrorHandler("Password does not match", 404));

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    sendToken(user, 200, res);
})

// Get User Details
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user,
    })
})

// Update Password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Old password is incorrect"), 400);
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHandler("Passwords didn't match"), 400);
    }

    if (req.body.oldPassword === req.body.newPassword) {
        return next(new ErrorHandler("New Password cannot be Old Password"), 400);
    }
    user.password = req.body.newPassword;
    await user.save();

    sendToken(user, 200, res);
})

// Update User Profile
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {

    if (!req.files || !req.files.avatar) {
        return next(new ErrorHandler('Please upload an avatar', 400));
    }
    const imageID = req.user.avatar.public_id;
    await cloudinary.v2.uploader.destroy(imageID);

    const avatarFile = req.files.avatar;

    const myCloud = await cloudinary.v2.uploader.upload(avatarFile.tempFilePath, {
        folder: "Avatars",
        width: 150,
        crop: "scale",
    });

    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        avatar: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        }
    }
    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    })

    res.status(200).json({
        success: true,
    })
})

// Get all users --Admin
exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
    const users = await User.find();
    res.status(200).json({
        success: true,
        users,
    })
})

// Get Single User -- Admin
exports.getUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return next(new ErrorHandler(`User does not exist with id: ${req.params.id}`), 400);
    }
    res.status(200).json({
        success: true,
        user,
    })
})

// Update User Role
exports.updateRole = catchAsyncErrors(async (req, res, next) => {

    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    })

    res.status(200).json({
        success: true,
    })
})

// Delete User
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {

    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler(`User does not exist with id: ${req.params.id}`), 400);
    }
    
    const imageID = req.user.avatar.public_id;
    await cloudinary.v2.uploader.destroy(imageID);

    await User.deleteOne({ _id: req.params.id });

    res.status(200).json({
        success: true,
        message: 'User deleted successfully',
    })
})

