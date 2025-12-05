import mongoose from "mongoose";



const MessageSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  },
User:{
 type: String,
},
  roomName: {
    type: String,
    required: true
  },

  sender: {
    type: String,
    required: true
  },

  time: {
    type: String,          // ex: "12:41:00 AM"
    required: true
  },
  connectionId:{
    type: String,          

  }
});

const MessageModal=mongoose.model("Message", MessageSchema);
export default MessageModal;
