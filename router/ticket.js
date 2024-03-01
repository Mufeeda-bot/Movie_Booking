const express = require('express');
const router = express.Router();

const Movie = require('../models/movies');

router.get('/movies', async (req, res) => {
    try {
        // Fetch all movies
        const movies = await Movie.find({});
        res.status(200).json(movies);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error! Something went wrong." });
    }
});


router.get('/movies/:id', async (req, res) => {
    try {
        const movieId = req.params.id;
        const movie = await Movie.findOne({ _id: movieId, status: { $ne: "disabled" } });
        // Return 404 if movie not found or disabled
        if (!movie) {
            return res.status(404).json({ success: false, message: "Movie not found." });
        }
        res.json(movie);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error! Something went wrong." });
    }
});
router.post('/movies', (req, res) => {
    const movie = new Movie({
        title: req.body.title,
        description: req.body.description,
        releaseDate: req.body.releaseDate,
        featured: req.body.featured,
        actors: req.body.actors,
        posterUrl: req.body.posterUrl
    });

    movie.save()
        .then(() => {
            res.status(201).json({ message: 'Movie added successfully' });
        })
        .catch((error) => {
            res.status(500).json({ error: 'Internal server error' });
        });
});

router.put('/movies/:id', (req, res) => {
    const movieId = req.params.id;
    const update = {
        title: req.body.title,
        description: req.body.description,
        releaseDate: req.body.releaseDate,
        featured: req.body.featured,
        actors: req.body.actors,
        posterUrl: req.body.posterUrl
    };

    Movie.findByIdAndUpdate(movieId, update)
        .then(() => {
            res.json({ message: 'Movie updated successfully' });
        })
        .catch((error) => {
            res.status(500).json({ error: 'Internal server error' });
        });
});

router.delete('/movies/:id', (req, res) => {
    const movieId = req.params.id;

    Movie.findByIdAndDelete(movieId)
        .then(() => {
            res.json({ message: 'Movie deleted successfully' });
        })
        .catch((error) => {
            res.status(500).json({ error: 'Internal server error' });
        });
});

module.exports = router;
