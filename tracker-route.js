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
       return res.status(400).send({msg:"invalid"})
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
            return res.status(400).send({msg:"invalid"});
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
            res.send({msg:"invalid"});
             return res.status(404);
             
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

// -----------deleting an item in box------------

router.patch("/delete/:email/:itemid",auth,async(req,res)=>{

    console.log("delete alert !!!")


        Tracker.findOneAndUpdate(
        {email:req.params.email}, 
         {$pull: {
            box: { _id:{$eq:req.params.itemid}}
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
             console.log(" entry deleted from box >>>",m)
         }
         
     }).catch((err) => {
         res.status(500).send({err:err.message});
         console.log("error in deleting entry from box !!!",err)
     })
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
        subject: 'Password reset link from Bill Box',
        html:`<h3>Verification Link from Bill Box</h3><p>${link}</p>`
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
  
//   --------verifying the token received-------
  
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
