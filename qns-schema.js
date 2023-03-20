const mongoose = require('mongoose');


const QnsSchema = new mongoose.Schema({
    roomcode:{
        type: String,
        required : true,
    },
    Questions: {
        type: [],
        required: true,
    },
    Options: {
        type: [],
        required: false,
    },
    Answer: {
        type: [],
        required : false
    }

})

const qns = new mongoose.model("Question", QnsSchema);

module.exports = qns;