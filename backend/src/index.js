import dotenv from "dotenv";
dotenv.config();

import connectDB from "./db/index.js";
import { app } from "./app.js";


const port = process.env.PORT || 8000

connectDB()
.then(() => {
    app.listen(port, () => {
        console.log(`Server is running at ${port}`);
    })
    app.on("error", (error) => {
            console.log("Error communicating with database", error);
            throw error;
        })
})
.catch((error) => {
    console.log("MongoDb connection failed.", error);

} )


/*
import mongoose from "mongoose";
import { DB_NAME } from "./constants";


import express from "express";

const app = express();


(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log("Connected to MongoDB");

        app.on("error", (error) => {
            console.log("Error communicating with database", error);
            throw error;
        })

        app.listen(process.env.PORT, () => console.log(`App is listening on port ${process.env.PORT}`))
    
    } catch (error) {
        console.error("Error connecting to MongoDB", error);
        throw error;
    }
})()
*/