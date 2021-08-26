
import jwt from "jsonwebtoken"

export const auth=(req,res,next)=>{

    try{
const token =req.header("x-auth-token");
console.log("live user token >>>",token);
jwt.verify(token,"mysecretkey");
next();
}
catch(err){
    console.log("error in token match >>>",err)
    res.status(500).send({error:err,message:"user not matched"});
}
}