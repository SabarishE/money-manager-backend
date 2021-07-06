import express from "express";

import {Tracker} from "./tracker-schema.js";

const router =express.Router();

router.get("/",async(req,res)=>{

    const  data= await Tracker.find();
    console.log(data);
    res.send(data);
    
})

router.post("/",async(req,res)=>{

    const adddata=req.body ;
    console.log(adddata);
  
   const newdata = new Tracker(adddata);

    const newaddition =await newdata.save();
    res.send(newaddition);

})

router.delete("/:id",async(req,res)=>{

    const { id }= req.params;
    console.log(id);
  
    try {
  
    const data = await Tracker.findById(id);
    await user.remove();
    res.send({...data,message:"data is deleted"});
    console.log("data with above ID is deleted");
    }
   catch(err)
   {
     res.status(500);
     res.send("data not found in trackerDB");
     console.log("err: user not found");
   }
  
  })
  
  export default router;