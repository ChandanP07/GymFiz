const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
    Username : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    created_at : {
        type : Date,
    }
})

const member = mongoose.model("member", memberSchema);

module.exports = member;