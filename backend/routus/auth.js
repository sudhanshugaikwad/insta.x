
const express =require("express")
const mongoose = require("mongoose");
require('../moduls/moduls')
const router = express.Router()
const USER = mongoose.model("USER")
const bcrypt = require('bcrypt')
const jwt =require("jsonwebtoken")
const {Jwt_secret} = require("../Keys");
const requirelogin = require("../middelware/requirelogin");

router.get('/',(req,res)=>{
    res.send("It is insta. Backend...!")
})




// This is endpoint use for signup functionalyty
router.post("/signup", async (req, res) => {
    const {name,userName,email,password} = req.body;

    if(!name || !email || !userName || !password){
    return res.status(422).json({error:"Please add all the fields"})
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUserName = userName.trim();
    const existingUser = await USER.findOne({
      $or: [{email: normalizedEmail}, {userName: normalizedUserName}]
    });

    if(existingUser){
      return res.status(409).json({error:"User already exists with that email or username"});
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await USER.create({
      name: name.trim(),
      email: normalizedEmail,
      userName: normalizedUserName,
      password: hashedPassword
    });

    return res.status(201).json({message:"User registered successfully"});
  } catch (error) {
    console.error("Signup failed:", error);
    return res.status(500).json({error:"Unable to register user"});
  }
});


// This is endpoint create for signin functionality



router.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(422).json({ error: "Please add email and password" });
    }

    try {
        const saveUser = await USER.findOne({ email: email.trim().toLowerCase() });
        if (!saveUser || !(await bcrypt.compare(password, saveUser.password))) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const token = jwt.sign({_id: saveUser.id}, Jwt_secret, {expiresIn: "7d"});
        const {_id, name, userName, Photo} = saveUser;
        return res.json({
            token,
          user: {_id, name, email: saveUser.email, userName, Photo}
        });
    } catch (error) {
        console.error("Signin failed:", error);
        return res.status(500).json({error:"Unable to sign in"});
    }
});

router.put("/profile", requirelogin, async (req, res) => {
  const { name, userName, email, Photo } = req.body;
  if (!name?.trim() || !userName?.trim() || !email?.trim()) {
    return res.status(422).json({ error: "Name, username, and email are required" });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUserName = userName.trim();
    const existingUser = await USER.findOne({
      $or: [{ email: normalizedEmail }, { userName: normalizedUserName }],
      _id: { $ne: req.user._id },
    });
    if (existingUser) {
      return res.status(409).json({ error: "Email or username is already in use" });
    }

    const updatedUser = await USER.findByIdAndUpdate(
      req.user._id,
      { name: name.trim(), userName: normalizedUserName, email: normalizedEmail, Photo: Photo || "" },
      { new: true, runValidators: true, select: "_id name userName email Photo" },
    );
    return res.json({ user: updatedUser });
  } catch (error) {
    console.error("Profile update failed:", error);
    return res.status(500).json({ error: "Unable to update profile" });
  }
});
  









module.exports = router;