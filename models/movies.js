const mongoose = require('mongoose');

const movieSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    language: {
        type: String
    },
    actors: [
        {
            type: String,
            required: true
        }
    ],
    releaseDate: {
        type: Date,
        required: true
    },
   
    Directors: [
        {
            type: String
        }
    ],
    posterUrl: {
        type: String,
        required: true
    },
    bookings: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'booking'
        }
    ],
    bookedSeats: [
        {
            type: String 
        }
    ],
    status: { type: String, default: "active" } 
});

module.exports  = mongoose.model('Movie', movieSchema);

