const mongoose = require("mongoose")

const Mail = mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    recieveMail:String,
    mailtext:String,
})

module.exports = mongoose.model("mails",Mail)