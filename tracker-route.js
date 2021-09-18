import express, { request } from "express";

import {Tracker} from "./tracker-schema.js";
import { auth } from "./auth.js";
import { transporter } from "./nodemailer.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"

const router =express.Router();

// -------signup of a new user------- 

router.post("/signup",async(req,res)=>{

    try{
    const adduser=req.body ;
   console.log("signup alert!!!",adduser);

   let emailcheck =await Tracker.findOne({email:adduser.email});
   if(emailcheck) {
       return res.status(400).send({msg:"User exists"})
   }
    const salt=await bcrypt.genSalt(10);
    const passwordHash =await bcrypt.hash(adduser.password,salt);
  
    console.log("After new SIGNUP >>>","\n",adduser);
    console.log(`password hash for the password'${adduser.password}'is >>> ${passwordHash}`)
   
    if(req.body.admin){
        const newuser = new Tracker({

            name:adduser.name,
            email:adduser.email,
            passwordHash,
            admin:true
        });
           const newaddition =await newuser.save();
           res.send({newuser:newaddition});
    }
    else{
        const newuser = new Tracker({

            name:adduser.name,
            email:adduser.email,
            passwordHash,
        });
        
            const newaddition =await newuser.save();
            res.send({newuser:newaddition});
    }
}
catch(err){
    res.send(err);
    console.log("error in signup!!!",err)
}
})


// -------- login of existing user ---------

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
            res.send({msg:"invalid credentials"});
            console.log("---- invalid credentials----");
           return res.status(500);
          
        }
        const token=jwt.sign({id:userLoggingIn.id,email:userLoggingIn.email},"mysecretkey");
  
        res.send({user:userLoggingIn.name,email:userLoggingIn.email,token,message:"login success"});
        console.log("---- successful login----");
      
      }
      
      catch(err)
      {
        res.status(500);
        res.send({err:err.message});
        console.log("Error in finding the user!!!",err);
      }

})


// -------adding a new entry-------
router.patch("/newentry/:email",auth,async(req,res)=>{

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
             res.send({newaddition:m});
             console.log("new entry added to box >>>",m)
         }
         
     }).catch((err) => {
         res.status(500).send({err:err.message});
         console.log("error in adding new entry to box !!!",err)
     })
})

// -------getting data of logged in user------- 

router.get("/user/:email",auth,async(req,res)=>{
    try{
        const  data= await Tracker.findOne({email:req.params.email});
        console.log("user details >>>",req.params.email);
        res.send({user:data});
    }
    catch(err){
        res.send({err:err.message})
        console.log("error in finding the user")
    }
})

// -----------editing an item in box------------

router.patch("/edit/:email/:itemid",auth,async(req,res)=>{

    console.log("edit alert !!!")


        Tracker.findOneAndUpdate(
        {"email":req.params.email,"box._id":req.params.itemid}, 
         {$set: {
            "box.$.type": req.body.type,
            "box.$.division":req.body.division,
            "box.$.category":req.body.category,
            "box.$.amount": req.body.amount,
            "box.$.date": new Date(req.body.date)
         }}
     ,{new: true,useFindAndModify:false}
         )
     
     .then((m) => {
         if (!m) {
            console.log("error in patch");
             return res.status(404).send();
             
         }
         else{
             res.send({newaddition:m});
             console.log("new entry added to box >>>",m)
         }
         
     }).catch((err) => {
         res.status(500).send({err:err.message});
         console.log("error in adding new entry to box !!!",err)
     })
})


// ------------ADMIN access to all data-----------

router.get("/admin/:email",auth,async(req,res)=>{
    try{
        const  data= await Tracker.findOne({email:req.params.email});
       if(!data||data.admin===false){

        res.send({msg:"invalid credentials"})
           console.log("invalid admin credentials")
           return res.status(400)
       }

       const admindata=await Tracker.find().select(["-passwordHash"]);
       res.send({admin:admindata});
       res.status(200);
       
    }
    catch(err){
        res.send({err:err.message})
        console.log("error in finding the user")
    }
})


// --------------Password Reset Flow Starts------------




// ------sending one time link to user's mail to change password -----

router.post("/forgotpwd",async(req,res)=>{

    console.log("forgot pwd alert !!!");

 try{

    const pwdrequester= await Tracker.findOne({email:req.body.email});
   
    if(!pwdrequester){
res.sendStatus(400).send({msg:"invalid credentials"});
    }
const secretKey= pwdrequester.passwordHash;
  
      const payload={name:pwdrequester.email}
  
      const token =jwt.sign(payload,secretKey);
  
        Tracker.findOneAndUpdate({email:req.body.email},{tempString:secretKey},{new: true,useFindAndModify: false})
        .then((x)=>console.log("user details with string update>>>>>",x))
      
    //   ---creating and sending one time link---
  
       const base =req.body.link
       const link= base+"/"+pwdrequester.email+"/"+token;
  
  
      console.log("one time link >>>>",link);
  
  //-----sending one time link through mail using "nodemailer"
  
  
      var mailOptions = {
        from: 'one.trial.one.trial@gmail.com',
        to:pwdrequester.email ,
        subject: 'reset password mail',
        text: link
      };
  
      transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
  });
  
  
      res.send({onetimelink:link,email:pwdrequester.email});
    }
  catch(err) {
      res.status(500);
      res.send(err.message);
      console.log("Error  !!!");
  
    }
  
  });
  
  
  
  router.get("/resetpwd/:email/:token",async(req,res)=>{

    console.log("reset pwd alert GET !!!");
  
  const {email,token}=req.params;

  const pwdrequester= await Tracker.findOne({email});
  
      //----- Verification of received JWT token ------

    jwt.verify(token,pwdrequester.tempString,async(err,data)=>{

        if(err){
            res.sendStatus(403).send({msg:"Request Forbidden"})
            console.log("access forbidden")
        }
        else{
            console.log("password change allowed!!!",data);
            res.send({msg:"Request Accepted"})
        }
    });

});
  
  
  //---------- new password post and update -----------
  
   router.post("/resetpwd/:email/:token",async(req,res)=>{
  
  
    console.log("reset pwd alert POST !!!");

    try{

    const salt=await bcrypt.genSalt(10);
  
    const passwordHash =await bcrypt.hash(req.body.pwd,salt);
  
        Tracker.findOneAndUpdate({email:req.params.email},{passwordHash,tempString:""},{new: true,useFindAndModify: false})
      
      .then((m) => {
          if (!m) {
              console.log("error in password change");
              return res.status(404);
          }
          else{
              res.send({msg:"Password Changed Successfully"});
              console.log("password changed",m)
          }
        })
    
     }
     catch(err){
       res.status(500).send({err:err.message});
       console.log("error in password change");
     }
 });


  export default router;






//-----filtering of documents-------- 

//-----based on a year-------- 

// router.get("/:email/filter/byyear/:year",async(req,res)=>{

//     try{

//         // const  data= await Tracker.find({ $expr: {
//         //     $eq: [{ $year: "$date" },+req.params.year]
//         //     }})
//         const  data= await Tracker.find({
//             box:{$expr: {
//             $eq: [{ $year: "$date" },+req.params.year]
//             }},email:req.params.email
//                    })



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
//         console.log(data, req.params.year);
//         res.send(data);
//     }
//     catch(err){
        
//             res.status(500);
//             res.send({msg:"error in finding by year",error:err});
//             console.log("err: data not found for the year",req.params.year );
//     }
// })

//-------between 2 dates-------- 

// router.get("/filter/between2dates/:from/:to",async(req,res)=>{

//     try{

//         const  data= await Tracker.find({ date: {
//             $gte:new Date(req.params.from) ,
//             $lte:new Date(req.params.to)
//             }})
//         // const  data= await Tracker.find({ "$where": this.date.getFullYear() === req.params.year)} });
//         console.log("data successfully found between 2 given dates",data);
//         res.send(data);
//     }
//     catch(err){
        
//             res.status(500);
//             res.send({msg:"error in finding by year",error:err});
//             console.log("err: data not found between 2 years");
//     }
// })

//-----based on a month of given year-------- 

// router.get("/filter/bymonth/:year/:month",async(req,res)=>{

//     try{

//         const  data= await Tracker.find({$and:[ {$expr: {
//             $eq: [{ $year: "$date" },+req.params.year]
//             }},
//             {$expr: {
//                 $eq: [{ $month: "$date" },+req.params.month]
//                 }}
//         ]})
//         // const  data= await Tracker.find({ "$where": this.date.getFullYear() === req.params.year)} });
//         console.log("data successfully found for given month of year");
//         res.send(data);
//     }
//     catch(err){
        
//             res.status(500);
//             res.send({msg:"error in finding by month",error:err});
//             console.log("err: data not found for the given month of >>>",req.params.year );
//     }
// })  

// ------- based on type---------

// router.get("/filter/bytype/:type",async(req,res)=>{

//     try{

//         const  data= await Tracker.find({type:req.params.type})
//         console.log("data successfully found for given type");
//         res.send(data);
//     }
//     catch(err){
        
//             res.status(500);
//             res.send({msg:"error in finding by type",error:err});
//             console.log("err: data not found for the given type >>>",req.params.type );
//         }
//   })

// ------- based on division---------

// router.get("/filter/bydivision/:division",async(req,res)=>{

//     try{

//         const  data= await Tracker.find({division:req.params.division})
//         console.log("data successfully found for given division");
//         res.send(data);
//     }
//     catch(err){
        
//             res.status(500);
//             res.send({msg:"error in finding by division",error:err});
//             console.log("err: data not found for the given division >>>",req.params.division );
//     }
// })


// ------- based on category---------

// router.get("/filter/bycategory/:category",async(req,res)=>{

//     try{

//         const  data= await Tracker.find({category:req.params.category})
//         console.log("data successfully found for given category");
//         res.send(data);
//     }
//     catch(err){
        
//             res.status(500);
//             res.send({msg:"error in finding by category",error:err});
//             console.log("err: data not found for the given category >>>",req.params.category );
//     }
// })

