const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");


let Admin=require('../models/admin');
const Movie= require('../models/movies');

/*const verifyAdminToken = (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  console.log(token);
  if (!token) {
      return res.status(401).json({ success: false, message: "Error! Token was not provided." });
  }

  try {
      const decodedToken = jwt.verify(token, "mashup_secret_key");
      req.admin = decodedToken; 
      next();
  } catch (error) {
      console.error(error);
      res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
};*/


router.post("/signup", async (req, res, next) => {
    const { email, password } = req.body;
    const newAdmin = Admin({
      email,
      password
    });
   
    try {
      await newAdmin.save();
    } catch {
      const error = new Error("Error! Something went wrong.");
      return next(error);
    }
    
    res
      .status(201)
      .json({
        success: true,
        data: { userId: newAdmin.id,
            email: newAdmin.email
         },
         message:"Admin created successfully"
      });
  });


router.post("/login", async (req, res, next) => {
    let { email, password } = req.body;
   
    let existingAdmin;
    try {
      existingAdmin = await Admin.findOne({ email: email });
    } catch {
      const error = new Error("Error! Something went wrong.");
      return next(error);
    }
    if (!existingAdmin || existingAdmin.password != password) {
      return res.status(400).json({ message:"Wrong details please check at once"});
    }
    let token;
    try {
    
      token = jwt.sign(
        { userId: existingAdmin.id, email: existingAdmin.email },
        "mashup_secret_key",
        { expiresIn: "1h" }
      );
    } catch (err) {
      console.log(err);
      const error = new Error("Error! Something went wrong.");
      return next(error);
    }
   
    res
      .status(200)
      .json({
        success: true,
        data: {
          userId: existingAdmin.id,
          email: existingAdmin.email,
          token: token,
        },
        message:"Login Successful"
      });
  });


  router.get('/movies',function(req,res){
    Movie.find({}).then(function(movies){
      res.json(movies);
    })
  });
  router.get('/movies/:id',function(req,res){
    let movieId =req.params.id
    Movie.findById(movieId).then(function(movie){
      res.json(movie);
    })
  })

  router.post("/movies", async (req, res) => {
    try {
        const newMovie = new Movie({
            title: req.body.title,
            description: req.body.description,
            language: req.body.language,
            releaseDate: req.body.releaseDate,
            Directors: req.body.Directors,
            actors: req.body.actors,
            posterUrl: req.body.posterUrl
        });

        await newMovie.save();
        res.status(201).json({ success: true, message: "Movie added successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error! Something went wrong." });
    }
});
router.put("/movies/:id",  async (req, res) => {
  try {
      const movieId = req.params.id;
      const updatedMovie = {
          title: req.body.title,
          description: req.body.description,
          language: req.body.language,
          releaseDate: req.body.releaseDate,
          Directors: req.body.Directors,
          actors: req.body.actors,
          posterUrl: req.body.posterUrl,
      };

      const query = { _id: movieId };
      await Movie.updateOne(query, updatedMovie);
      res.status(200).json({ success: true, message: "Movie updated successfully." });
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Error! Something went wrong." });
  }
});

router.delete("/movies/:id", async (req, res) => {
  try {
      const movieId = req.params.id;
      const query = { _id: movieId };
      await Movie.deleteOne(query);
      res.status(200).json({ success: true, message: "Movie deleted successfully." });
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Error! Something went wrong." });
  }
});

router.get("/movies", async (req, res) => {
  try {
      const movies = await Movie.find({});
      res.status(200).json(movies);
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Error! Something went wrong." });
  }
});

router.put('/movies/:id/enable', async (req, res) => {
  try {
      const movieId = req.params.id;
      const movie = await Movie.findById(movieId);
      
      if (!movie || movie.status !== 'disabled') {
          return res.status(404).json({ success: false, message: "Movie not found or not disabled." });
      }
      
      movie.status = 'active';
      await movie.save();
      
      res.status(200).json({ success: true, message: "Movie enabled successfully." });
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Error! Something went wrong." });
  }
});
  
router.put('/movies/:id/disable', async (req, res) => {
  try {
      const movieId = req.params.id;
      const movie = await Movie.findById(movieId);
      
      if (!movie || movie.status !== 'active') {
          return res.status(404).json({ success: false, message: "Movie not found or not active." });
      }
      
      movie.status = 'disabled';
      await movie.save();
      
      res.status(200).json({ success: true, message: "Movie disabled successfully." });
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Error! Something went wrong." });
  }
});

module.exports = router;