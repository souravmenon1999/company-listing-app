const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: String,
    imgUrl: String,
    category: Array,
    description: String,
    vote: Number,
    link: String,
    comments: Array,
    commentLength: Number
})

module.exports = mongoose.model('products', productSchema);