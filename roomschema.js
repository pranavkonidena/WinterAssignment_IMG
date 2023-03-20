const mongoose = require('mongoose');


const RoomSchema = new mongoose.Schema({
    roomcode:{
        type: String,
        required : true,
    },
    tf: {
        type: Object,
        required: false,
    },
    scq: {
        type: Object,
        required: false,
    },
    num: {
        type: Object,
        required : false
    }

})

const rooms = new mongoose.model("Room", RoomSchema);

module.exports = rooms;