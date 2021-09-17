import mongoose from "mongoose";

const trackerschema= new mongoose.Schema({

    name:{type:String,required:true},
    email:{type:String,required:true},
    passwordHash:{type:String},
tempString:{type:String},
    box:[
{
            type: {type:String},
            division:{type:String},
            category:{type:String},
            amount: {type:Number},
            description:{type:String},
            date: {type:Date,default: Date.now,}
}
    ]
    
    
})

export const Tracker = mongoose.model("tracker",trackerschema);
