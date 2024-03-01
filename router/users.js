const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");

let User=require('../models/user');

router.post("/signup", async (req, res, next) => {
    const { name, email, password } = req.body;
    const newUser = User({
      name,
      email,
      password
    });
   
    try {
      await newUser.save();
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Error! Something went wrong during signup." });
    }
    res
      .status(201)
      .json({
        success: true,
        data: { userId: newUser.id,
            email: newUser.email },
      });
  });


router.post("/login", async (req, res, next) => {
    let { email, password } = req.body;
   
    let existingUser;
    try {
      existingUser = await User.findOne({ email: email });
    } catch {
      const error = new Error("Error! Something went wrong.");
      return next(error);
    }
    if (!existingUser || existingUser.password != password) {
      const error = Error("Wrong details please check at once");
      return next(error);
    }
    let token;
    try {
    
      token = jwt.sign(
        { userId: existingUser.id, email: existingUser.email },
        "mashup_secret_key",
        { expiresIn: "1h" }
      );
    } catch (error) {
      console.error(error);
      res.status(401).json({ success: false, message: "Authentication failed. " + error.message });
  
    }
   
    res
      .status(200)
      .json({
        success: true,
        data: {
          userId: existingUser.id,
          email: existingUser.email,
          token: token,
        },
      });
  });

  router.get('/', (req, res)=>{
	const token = req.headers.authorization.split(' ')[1];
	if(!token)
	{
		res.status(200).json({success:false, message: "Error!Token was not provided."});
	}
	const decodedToken = jwt.verify(token,"mashup_secret_key" );
	res.status(200).json({success:true, data:{userId:decodedToken.userId,email:decodedToken.email}});
})
  
module.exports = router;