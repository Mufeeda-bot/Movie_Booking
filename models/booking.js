const mongoose = require("mongoose");

let bookingSchema = mongoose.Schema({
    movie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        
    },
    date: {
        type: String,
        required: true
    },
    timing: {
        type: String,
        required: true
       
    },
    movieDetails: {
        type: Object
    
    },
    
    userEmail: {
        type: String,
    
    },
    seats: {
        type: [String]
    },
    
   
})

module.exports = mongoose.model("Booking", bookingSchema);