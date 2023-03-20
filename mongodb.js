const mongoose = require('mongoose');


const LogInSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
    },
    password:{
        type: String,
        required: true
    }
})

const collection = new mongoose.model("User", LogInSchema);

module.exports = collection;