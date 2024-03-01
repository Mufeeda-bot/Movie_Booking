const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');

const Movie = require('../models/movies');
const Booking = require('../models/booking');

router.get('/book', (req, res) => {
    Booking.find({})
        .then((bookings) => {
            res.json(bookings);
        })
        .catch((error) => {
            res.status(400).json({ error: error.message });
        });
});

router.get('/book/:id', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('movie', 'title');
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        res.json(booking);
    } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/movies/:id', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            return res.status(404).json({ error: 'Movie not found' });
        }
        res.json(movie);
    } catch (error) {
        console.error('Error fetching movie:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/book/:movieId', async (req, res) => {
    const { movieId } = req.params;
    const { date, timing, userEmail, movieDetails, seats } = req.body;

    try {
        const movie = await Movie.findById(movieId);
        if (!movie) {
            return res.status(404).json({ error: 'Movie not found' });
        }
        const bookedSeats = movie.bookedSeats || [];
        const selectedSeatsArray = Array.isArray(seats) ? seats : [seats];

       const alreadyBooked = selectedSeatsArray.some(seat => bookedSeats.includes(seat));
       if (alreadyBooked) {
    return res.status(400).json({ error: 'Seat already booked' });
}

       
        movie.bookedSeats = [...bookedSeats, ...selectedSeatsArray];
        await movie.save();

        const booking = new Booking({
            movie: movieId,
            date,
            timing,
            movieDetails,
            seats:selectedSeatsArray
        
        });

        await booking.save();

        res.status(201).json(booking);
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ error: 'Failed to create booking' });
    }
});


router.delete('/book/:id', async (req, res) => {
    let bookingId = req.params.id;

    try {
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        await Booking.deleteOne({ _id: bookingId });

        const movie = await Movie.findById(booking.movie);
        if (movie && movie.bookedSeats) {
            // Remove booked seats associated with the deleted booking
            movie.bookedSeats = movie.bookedSeats.filter(seat => !booking.seats.includes(seat));
            await movie.save();
        }

        res.json({ message: "Booking deleted" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/download-ticket/:bookingId', async (req, res) => {
    try {
        // Fetch booking details from the database using bookingId
        const booking = await Booking.findById(req.params.bookingId).populate('movie');

        // Create a new PDF document
        const doc = new PDFDocument();
        doc.pipe(res); // Pipe the PDF output directly to the response

        doc.fontSize(16).text('Booking Ticket', { align: 'center' }).moveDown(0.5);
        doc.text(`Booking ID: ${booking._id}`);
        doc.text(`Movie: ${booking.movie.title}`);
        doc.text(`Date: ${new Date(booking.date).toLocaleDateString()}`);
        doc.text(`Time: ${booking.timing}`);
        doc.text(`Time: ${booking.seats}`);

        doc.end();
    } catch (error) {
        console.error('Error generating ticket PDF:', error);
        res.status(500).json({ error: 'Failed to generate ticket PDF' });
    }
});

module.exports = router;