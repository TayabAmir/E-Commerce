const app = require("./app")
const dotenv = require("dotenv");
const connectDatabase = require("./config/database");
const path = require("path")
const cloudinary = require("cloudinary");

//Config
dotenv.config({ path: path.resolve(__dirname, './config/.env') });

// Handling uncaught Exceptions
process.on("uncaughtException",(err)=>{
    console.log(`Error: ${err.message}`)
    console.log("Shutting down the server because of uncaught Exceptions");

        process.exit(1);
})

// Connect Database
connectDatabase();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET 
})

const server = app.listen(process.env.PORT,()=>{
    console.log(`Server is working on http://localhost:${process.env.PORT}`)
})

// Unhandled Promise Rejection
process.on("unhandledRejection",(err)=>{
    console.log(`Error: ${err.message}`)
    console.log("Shutting down the server because of unhandled promise rejection");
    server.close(()=>{
        process.exit(1);
    })
})