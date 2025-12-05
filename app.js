import express from 'express'
import cors from 'cors'
import AuthRouter from './Routes/AuthRouter.js';
import UserRouter from './Routes/UserRoutes.js';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import http from 'http';
import ChannelModal from './Models/ChannelModel.js';
import UserModel from './Models/UserModel.js';
import MessageModal from './Models/MessageModel.js';

const app = express();
app.use(express.json());
app.use(cors({
  origin: "*",
}));

let OnlineUserChannelObj = {}
// Create HTTP server (required for socket.io)
const server = http.createServer(app);

// Attach socket.io server
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});
let UserObj = {}
// Simple socket.io connection
io.on("connection", (socket) => {
  // console.log("UserObj[socket.id]:",typeof UserObj[socket.id]);
  // if(UserObj[socket.id]==undefined){
  // UserObj[socket.id]='abhaykadu'

  // }


  socket.on("joinRoom",async ({ ActiveChannel, User, PrevUserChannel }) => {
    console.log('UserObjUser', User)

    let Channel=await ChannelModal.findOne({name:ActiveChannel})
    let UserDetails=await UserModel.findOne({name:User})
  if (!Channel.members.includes(UserDetails?._id)) {
    socket.emit("JoinDenied", { msg: `You are not a member of ${ActiveChannel}.` });
    return; // prevent further execution
  }

    if (!UserObj[socket.id]) {
      UserObj[socket.id] = {
        RegisteredUser: User,
        RegisteredRoom: ActiveChannel
      };
    } else {
      // if the same socket switches room or username changes
      UserObj[socket.id].RegisteredUser = User;
      UserObj[socket.id].RegisteredRoom = ActiveChannel;
    }

    // console.log("PrevUserChannel", PrevUserChannel)
    // console.log("ActiveChannel", ActiveChannel)
    // console.log("UserObj", UserObj)

    if (PrevUserChannel && OnlineUserChannelObj[PrevUserChannel]) {
      OnlineUserChannelObj[PrevUserChannel] = OnlineUserChannelObj[PrevUserChannel].filter(
        (ele) => ele !== User && ele !== ""
      );
      socket.leave(PrevUserChannel);
      io.to(PrevUserChannel).emit('OnlineUsers', { lst: OnlineUserChannelObj[PrevUserChannel], PrevChannelName: PrevUserChannel });

    }


    if (!OnlineUserChannelObj[ActiveChannel]) {
      OnlineUserChannelObj[ActiveChannel] = [];
    }
    if (!OnlineUserChannelObj[ActiveChannel].includes(User)) {
      OnlineUserChannelObj[ActiveChannel].push(User);
    }
    // console.log('OnlineUserChannelObj', OnlineUserChannelObj)
    socket.join(ActiveChannel);
    io.to(ActiveChannel).emit('OnlineUsers', { lst: OnlineUserChannelObj[ActiveChannel], PrevChannelName: ActiveChannel });

  });
  socket.on("isTyping",async(Val)=>{
    const {ActiveChannel,user}=Val
    socket.to(ActiveChannel).emit('SomeOneTyping',{ActiveChannel,user})

    console.log('is typing ',Val)

  })
  socket.on("sendMessage", async({ roomName, message,sender,time }) => {
    let Msg={
      message,
      sender: UserObj[socket.id]?.RegisteredUser,
      User:UserObj[socket.id]?.RegisteredUser,
      roomName:roomName,
      time:time

    }
    let NewMessage=new MessageModal(Msg)
    await NewMessage.save()
    socket.to(roomName).emit("receiveMessage", Msg);
    
  });

  socket.on("disconnect", () => {
    const Obj = UserObj[socket.id];

    if (Obj) {
      OnlineUserChannelObj[Obj.RegisteredRoom] =
        OnlineUserChannelObj[Obj.RegisteredRoom]?.filter(
          (ele) => ele !== Obj.RegisteredUser
        );

      io.to(Obj.RegisteredRoom).emit("OnlineUsers", {
        lst: OnlineUserChannelObj[Obj.RegisteredRoom],
        PrevChannelName: Obj.RegisteredRoom,
      });
    }

    delete UserObj[socket.id];

    // console.log("Socket disconnected:", OnlineUserChannelObj);
    // console.log("Updated UserObj:", UserObj);
  });


});

// Routers
app.use("/", UserRouter)
app.use("/Auth", AuthRouter)

let MongoUrl = `mongodb+srv://abhaykadu203_db_user:HHPBR31o0zKG08Ry@cluster0.qnuzsdq.mongodb.net/`

async function connectDB() {
  try {
    await mongoose.connect(MongoUrl);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
}

connectDB();

// Start server
server.listen(8080, () => {
  console.log('app is listening on 8080');
});
