// require('dotenv').config({path: './env'})
import dotenv from "dotenv"
import connectDB from "./db/index.js"

dotenv.config({
    path: "./env"
})

const port = process.env.PORT || 8000;
connectDB()
.then(
    app.listen(port, ()=>{
        console.log(`Server is runnin at: ${port}`);
    })
)
.catch((err)=>{
    console.log("MONGODB connection failed !!!",err);
})









/*
import express from 'express'
const app = express()

( async () =>{
    try{
        await mongoose.connect(`${MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error)=> {
            console.log("Error! ",error);
            throw error
        })

        app.listen(process.env.PORT, ()=>{
            console.log(`App is listening on ${process.env.PORT}`)
        })


    }catch(error){
        console.error("Error! ",error)
        throw err
    }
} )()

*/