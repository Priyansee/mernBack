const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String    
});

module.exports = mongoose.model('users', userSchema); // users collection banaayo mongoose me, userSchema me user data type define karaayo