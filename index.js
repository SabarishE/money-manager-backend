import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import router from "./tracker-route.js";

 const app=express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.listen(PORT,console.log("server started"));

 const url= process.env.MONGODB_URI || "mongodb://localhost/trackerDB";

mongoose.connect(url,{useNewUrlParser:true,useUnifiedTopology: true});

const con=mongoose.connection;

con.on("open",()=>console.log("MongoDB in connected"));


app.use("/trackers",router);

app.get("/",(req,res)=>{
    res.send("Heroku Homepage -- heroku deployed");
    
      })

export default app;
