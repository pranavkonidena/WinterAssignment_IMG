const mongoose = require('mongoose');


const TeamSchema = new mongoose.Schema({
    roomcode:{
        type: String,
        required : true,
    },
    teamid:{
        type: String,
        required : true,
    },
    users:{
        type:Array,
        required:true
    }

})

const teams = new mongoose.model("Team", TeamSchema);

module.exports = teams;