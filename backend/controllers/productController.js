const Product = require("../models/productModel");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/ApiFeatures");
const cloudinary = require("cloudinary")

// Create Product -- Admin
exports.createProduct = catchAsyncErrors(async (req, res, next) => {

    if (!req.files || !req.files.images || req.files.images.length === 0) {
        return next(new ErrorHandler('Please upload at least one image', 400));
    }

    let images = [];

    if (Array.isArray(req.files.images)) {
        images = req.files.images;
    } else {
        images.push(req.files.images);
    }

    const imagesLink = [];

    // Upload images to Cloudinary
    for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i].tempFilePath, {
            folder: "products",
        });
        imagesLink.push({
            public_id: result.public_id,
            url: result.secure_url,
        });
    }

    const { name, price, description, category, stock } = req.body;
    const user = req.user.id;

    const product = await Product.create({
        name,
        price,
        description,
        category,
        stock,
        user,
        images: imagesLink,
    });

    res.status(201).json({
        success: true,
        product,
    });
});

// Get Products
exports.getAllProducts = catchAsyncErrors(async (req, res, next) => {
    const productCount = await Product.countDocuments();
    const resultPerPage = productCount;

    const apiFeature = new ApiFeatures(Product.find(), req.query)
        .search()
        .filter()
        .pagination(resultPerPage);

    const products = await apiFeature.query;
    res.status(200).json(
        {
            success: true,
            products,
            productCount,
            resultPerPage,
        })
});

// Get Product Details
exports.getProductDetails = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Product not Found", 404));
    }
    res.status(200).json(
        {
            success: true,
            product
        })
}
)

// Update Product -- Admin
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
    let product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }

    if (!req.files || !req.files.images || req.files.images.length === 0) {
        return next(new ErrorHandler('Please upload at least one image', 400));
    }

    let images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];

    for (let i = 0; i < product.images.length; i++) {
        await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

    const imagesLink = [];
    for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i].tempFilePath, {
            folder: "products",
        });
        imagesLink.push({
            public_id: result.public_id,
            url: result.secure_url,
        });
    }

    const { name, price, description, category, Stock } = req.body;
    const user = req.user.id;

    product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name,
            price,
            description,
            category,
            stock: Stock,
            user,
            images: imagesLink,
        },
        {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        }
    );

    // Return updated product
    res.status(200).json({
        success: true,
        product,
    });
});


// Delete Product -- Admin
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorHandler("Product not Found", 404));
    }
    // Deleting Images From Cloudinary
    for (let i = 0; i < product.images.length; i++) {
        await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }
    await Product.deleteOne({ _id: req.params.id });
    res.status(200).json(
        {
            success: true,
            message: "Product Deleted"
        })
})

// Create New Review or Update Review
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {

    const { rating, comment, productId } = req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    }

    const product = await Product.findById(productId);

    const isReviewed = product.reviews.find((rev) => (rev.user.toString() === req.user._id.toString()))

    if (isReviewed) {
        product.reviews.forEach(rev => {
            if (rev.user.toString() === req.user._id.toString()) {
                rev.rating = rating,
                rev.comment = comment
            }
        })
    }
    else {  
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }
    let avg = 0;
    product.reviews.forEach((rev) => {
        avg += rev.rating
    })
    product.ratings = avg / product.reviews.length;

    await product.save({ validateBeforeSave: false });
    res.status(200).json({
        success: true,
    })
})

// Get All Reviews of a product
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.id);

    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }

    res.status(200).json({
        success: true,
        reviews: product.reviews,
    });
});

// Delete Review
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.productId);

    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }

    const reviews = product.reviews.filter(
        (rev) => rev._id.toString() !== req.query.id.toString()
    );

    let avg = 0;

    reviews.forEach((rev) => {
        avg += rev.rating;
    });

    let ratings = 0;

    if (reviews.length === 0) {
        ratings = 0;
    } else {
        ratings = avg / reviews.length;
    }

    const numOfReviews = reviews.length;

    await Product.findByIdAndUpdate(
        req.query.productId,
        {
            reviews,
            ratings,
            numOfReviews,
        },
        {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        }
    );

    res.status(200).json({
        success: true,
    });
});