const jwt = require("jsonwebtoken")
const { Jwt_secret } =require("../Keys")
const mongoose = require("mongoose")

const USER  = mongoose.model("USER")



module.exports=(req,res,next)=>{
    const authorization = req.headers.authorization;
    if(!authorization || !authorization.startsWith("Bearer ")){
        return res.status(401).json({
            error:"You must have logged in -> 1"
        })
    }
        const token = authorization.replace("Bearer ","").trim()
        jwt.verify(token,Jwt_secret,(err,payload)=>{
            if(err){
                return res.status(401).json({
                    error:"You must have logged in -> 2 "
                })
            }
            const {_id}= payload
                            USER.findById(_id).then(userData =>{
                                if(!userData){
                                        return res.status(401).json({error:"User no longer exists"})
                                }
                                req.user = userData
                                next()
                        }).catch(() => res.status(500).json({error:"Unable to verify user"}))
        })
       
   
   
}