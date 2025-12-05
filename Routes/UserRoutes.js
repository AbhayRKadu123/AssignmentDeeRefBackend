import {GetAllUsers,GetAllMessages, GetUserDetails,GetAllChannel,IsMember,JoinChannel ,CreateChannel,LeaveChannel,GetChannelDetail} from "../controllers/UsersController.js";
import express from "express";
import { verifyToken } from "../MiddleWares/auth.js";
const UserRouter = express.Router();

UserRouter.get("/UserDetails",verifyToken,GetUserDetails)
UserRouter.get("/AllChannel",verifyToken,GetAllChannel)
UserRouter.put("/channels/:id/join",verifyToken,JoinChannel)
UserRouter.post("/CreateChannel",verifyToken,CreateChannel)
UserRouter.get("/IsMember/:id",verifyToken,IsMember)
UserRouter.put("/LeaveChannel/:id",verifyToken,LeaveChannel)
UserRouter.get("/GetAllUsers/:ActiveChannel",GetAllUsers)
UserRouter.get("/GetAllMessages",GetAllMessages)
export default UserRouter