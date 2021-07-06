import express from "express";
import mongoose from "mongoose";

import router from "./tracker-route.js";

const app=express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.listen(PORT,console.log("server started"));

 const url= process.env.MONGODB_URI || "mongodb://localhost/trackerDB";
// const url= "mongodb+srv://SabarishE:sabarishe@cluster0.eeimf.mongodb.net/trackerDB";
mongoose.connect(url,{useNewUrlParser:true});

const con=mongoose.connection;

con.on("open",()=>console.log("MongoDB in connected"));


app.use("/trackers",router);

app.get("/",(req,res)=>{
    res.send("Heroku Homepage -- heroku deployed");
    
      })
