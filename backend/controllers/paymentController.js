const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.processPayment = catchAsyncErrors(async (req, res, next) => {
    const { amount } = req.body;

    try {
        const payment = await stripe.paymentIntents.create({
            amount: amount,
            currency: "usd",
            metadata: {
                company: "Ecommerce",
            },
        });

        res.status(200).json({
            success: true,
            client_secret: payment.client_secret,
        });
    } catch (error) {
        console.error("Error creating payment intent:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});


exports.sendStripeApiKey = catchAsyncErrors(async (req, res, next) => {
    res.status(200).json({  
        stripeApiKey: process.env.STRIPE_API_KEY
    })
})