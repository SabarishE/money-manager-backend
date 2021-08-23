import express from "express";

import {Tracker} from "./tracker-schema.js";

const router =express.Router();

// -------adding a new document------- 

router.post("/",async(req,res)=>{

    const adddata=req.body ;
    console.log(adddata);
  
   
   const newdata = new Tracker({

    type:adddata.type,
    division:adddata.division,
    category:adddata.category,
    amount:adddata.amount,
    date:new Date(adddata.date)

   });

    const newaddition =await newdata.save();
    res.send(newaddition);

})

// -------deleting a document-------

router.delete("/:id",async(req,res)=>{

    const { id }= req.params;
    console.log(id);
  
    try {
  
    const data = await Tracker.findById(id);
    await data.remove();
    res.send({message:"data is deleted"});
    console.log("data with above ID is deleted");
    }
   catch(err)
   {
     res.status(500);
     res.send("data not found in trackerDB");
     console.log("err: user not found");
   }
  
  })

// -------getting all documents------- 

router.get("/",async(req,res)=>{

    const  data= await Tracker.find();
    console.log(data);
    res.send(data);
    
})

//-----filtering of documents-------- 

//-----based on a year-------- 

router.get("/filter/byyear/:year",async(req,res)=>{

    try{

        const  data= await Tracker.find({ $expr: {
            $eq: [{ $year: "$date" },+req.params.year]
            }})
        // const  data= await Tracker.find({ "$where": this.date.getFullYear() === req.params.year)} });
        console.log(data, req.params.year);
        res.send(data);
    }
    catch(err){
        
            res.status(500);
            res.send({msg:"error in finding by year",error:err});
            console.log("err: data not found for the year",req.params.year );
    }
})

//-------between 2 dates-------- 

router.get("/filter/between2dates/:from/:to",async(req,res)=>{

    try{

        const  data= await Tracker.find({ date: {
            $gte:new Date(req.params.from) ,
            $lte:new Date(req.params.to)
            }})
        // const  data= await Tracker.find({ "$where": this.date.getFullYear() === req.params.year)} });
        console.log("data successfully found between 2 given dates",data);
        res.send(data);
    }
    catch(err){
        
            res.status(500);
            res.send({msg:"error in finding by year",error:err});
            console.log("err: data not found between 2 years");
    }
})

//-----based on a month of given year-------- 

router.get("/filter/bymonth/:year/:month",async(req,res)=>{

    try{

        const  data= await Tracker.find({$and:[ {$expr: {
            $eq: [{ $year: "$date" },+req.params.year]
            }},
            {$expr: {
                $eq: [{ $month: "$date" },+req.params.month]
                }}
        ]})
        // const  data= await Tracker.find({ "$where": this.date.getFullYear() === req.params.year)} });
        console.log("data successfully found for given month of year");
        res.send(data);
    }
    catch(err){
        
            res.status(500);
            res.send({msg:"error in finding by month",error:err});
            console.log("err: data not found for the given month of >>>",req.params.year );
    }
})  

// ------- based on type---------

router.get("/filter/bytype/:type",async(req,res)=>{

    try{

        const  data= await Tracker.find({type:req.params.type})
        console.log("data successfully found for given type");
        res.send(data);
    }
    catch(err){
        
            res.status(500);
            res.send({msg:"error in finding by type",error:err});
            console.log("err: data not found for the given type >>>",req.params.type );
        }
  })

// ------- based on division---------

router.get("/filter/bydivision/:division",async(req,res)=>{

    try{

        const  data= await Tracker.find({division:req.params.division})
        console.log("data successfully found for given division");
        res.send(data);
    }
    catch(err){
        
            res.status(500);
            res.send({msg:"error in finding by division",error:err});
            console.log("err: data not found for the given division >>>",req.params.division );
    }
})


// ------- based on category---------

router.get("/filter/bycategory/:category",async(req,res)=>{

    try{

        const  data= await Tracker.find({category:req.params.category})
        console.log("data successfully found for given category");
        res.send(data);
    }
    catch(err){
        
            res.status(500);
            res.send({msg:"error in finding by category",error:err});
            console.log("err: data not found for the given category >>>",req.params.category );
    }
})


  export default router;