const mongoose = require("mongoose")
const plm = require("passport-local-mongoose")

async function connectedToDB() {
  try {
    await mongoose.connect("mongodb://localhost/MailAya");
  
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
  }
}

connectedToDB();

const userSchema = mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  username: {
    type: String,
    unique:true
  },
  phone: {
    type: Number,
  },

  sentMails: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "mails",
    }, 
  ],
  recievedMails: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "mails",
    },
  ],
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  profilePic:{
    type:String,
    default:"def.jpg"
  }
});

userSchema.plugin(plm);

module.exports = mongoose.model("user", userSchema);