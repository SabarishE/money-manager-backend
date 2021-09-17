import express from "express";

import {Tracker} from "./tracker-schema.js";
import { auth } from "./auth.js";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"

const router =express.Router();

// -------signup of a new user------- 

router.post("/signup",async(req,res)=>{

    try{
    const adduser=req.body ;
   console.log("signup alert!!!",adduser);

   let emailcheck =await Tracker.find({email:adduser.email});
   if(emailcheck) {
       return res.status(400).send({msg:"User exists"})
   }
    const salt=await bcrypt.genSalt(10);
    const passwordHash =await bcrypt.hash(adduser.password,salt);
  
    console.log("After new SIGNUP >>>","\n",adduser);
    console.log(`password hash for the password'${adduser.password}'is >>> ${passwordHash}`)
    const newuser = new Tracker({

    name:adduser.name,
    email:adduser.email,
    passwordHash

   });

    const newaddition =await newuser.save();
    res.send(newaddition);

}
catch(err){
    res.send(err);
    console.log("error in signup!!!",err)
}
})

// -------adding a new entry-------


router.patch("/newentry/:email",async(req,res)=>{

    console.log("params test >>>",req.params.email)
    Tracker.findOneAndUpdate(
        {email:req.params.email}, 
         {$push: {box :{
            type: req.body.type,
            division:req.body.division,
            category:req.body.category,
            amount: req.body.amount,
            date: new Date(req.body.date)
         }}}
     ,{new: true}
         )
     
     .then((m) => {
         if (!m) {
            console.log("error in patch");
             return res.status(404).send();
             
         }
         else{
             res.send(m);
             console.log("new entry added to box >>>",m)
         }
         
     }).catch((error) => {
         res.status(500).send({error});
         console.log("error in adding new entry to box !!!",error)
     })
})


// -------login of a user------- 

router.post("/login",async(req,res)=>{

    try{
        console.log("login alert !!!")
        const userLoggingIn= await Tracker.findOne({email:req.body.email});
     
        if(!userLoggingIn){
            return res.status(400).send({msg:"invalid credentials"});
        }
        const isMatch=await bcrypt.compare(req.body.password,userLoggingIn.passwordHash);

       
        if(!isMatch)
        {
            res.status(500);
            res.send({message:"invalid credentials"});
            console.log("---- invalid credentials----");
        }
        const token=jwt.sign({id:userLoggingIn.id,email:userLoggingIn.email},"mysecretkey");
        // res.header("x-auth-token",token);
        res.send({loggeduser:userLoggingIn,token,message:"login success"});
        console.log("---- successful login----");
      
      }
      
      catch(err)
      {
        res.status(500);
        res.send(err);
        console.log("Error in finding the user!!!",err);
      }

})

// -------forgot password------- 

// -------getting all documents------- 

router.get("/user/:email",auth,async(req,res)=>{
    try{
        const  data= await Tracker.findOne({email:req.params.email});
        console.log("user details >>>",req.params.email);
        res.send(data);
    }
    catch(err){
        res.send({message:"error in finding the user",err
    })
        console.log("error in finding the user")
    }
})

//-----filtering of documents-------- 

//-----based on a year-------- 

router.get("/:email/filter/byyear/:year",async(req,res)=>{

    try{

        // const  data= await Tracker.find({ $expr: {
        //     $eq: [{ $year: "$date" },+req.params.year]
        //     }})
        const  data= await Tracker.find({
            box:{$expr: {
            $eq: [{ $year: "$date" },+req.params.year]
            }},email:req.params.email
                   })



        // const  data= await Tracker.aggregate([{$match:{email:req.params.email}},
        //     {$unwind:"$box" }, 
        //     {$match: {$expr: {
        //     $eq: [{ $year: "$date" },+req.params.year]
        //     }}}


//         const  data= await Tracker.aggregate([{$match:{email:req.params.email}},
//             {$unwind:"$box" }, 
//             {$project: {box: { $filter: {
//           input: "$box",
//           as: "item",
//           cond: { $eq: [{ $year: "$date"},+req.params.year ]}
//                                        }
//                              }
//                        }
//             }
//   ]);



    //         { $project: {
    //      box: {
    //         $filter: {
    //            input: "$box",
    //            as: "item",
    //            cond: {$eq: [{ $year: "$date" },+req.params.year]  }
    //         }
    //      }
    //   }
    //     }
        // ]);



        // const  data= await Tracker.aggregate([{$match:{email:req.params.email}},
        //     {$unwind:"$box" }, 
        //     {$match:{"box.date":{$eq: [{ $year: "$date" },+req.params.year] }}}
        // ]);



    //    const  data= await Tracker.aggregate([{$match:{email:req.params.email}},
    //     {$unwind:"$box" }, 
    //     {$eq: [{ $year: "$date" },+req.params.year] }]);
//  const  data= await Tracker.aggregate([{email:req.params.email},
//  { $unwind: "$box" },
//             {$expr: {
//             $eq: [{ $year: "$date" },+req.params.year]
//             }}
//         ])

       
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