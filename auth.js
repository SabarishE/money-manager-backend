
import jwt from "jsonwebtoken"

export const auth=(req,res,next)=>{

        const token =req.header("x-auth-token");
        req.token=token;
        jwt.verify(req.token,"mysecretkey",async(err,data)=>{

        if(err){
            res.sendStatus(403)
        }
        else{
            console.log("auth success !!!",data);
            next();
        }
        
       
        });
     
}





