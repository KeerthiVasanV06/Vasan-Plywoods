const mongoose = require('mongoose');

const sliderImageSchema = new mongoose.Schema({
    image: {
        type: String,
        required: true
    },
    altText: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('SliderImage', sliderImageSchema);
