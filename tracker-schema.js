import mongoose from "mongoose";

const trackerschema= new mongoose.Schema({

    type: {type:String},
    division:{type:String},
    category:{type:String},
    amount: {type:Number},
    date: {type:String}
    
})

export const Tracker = mongoose.model("tracker",trackerschema);