const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    name: String,
    price: String,
    category: String,
    userId: String,
    material: String,   
});

module.exports = mongoose.model('products', productSchema);// users collection banaayo mongoose me, userSchema me user data type define karaayo