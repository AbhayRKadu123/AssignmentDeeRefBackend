import { json } from "express"
import ChannelModal from "../Models/ChannelModel.js"
import UserModel from "../Models/UserModel.js"
import MessageModal from "../Models/MessageModel.js"
const GetUserDetails = async (req, res) => {
    try {
        let UserDetails = await UserModel.findOne({ _id: req?.user?.id })
        res.status(200).json({ UserDetails })


    } catch (err) {
        res.status(500), json({ err: err })
    }

}
const GetAllChannel = async (req, res) => {
    try {
        let Channels = await ChannelModal.find({})
        res.status(200).json({ AllChannels: Channels })


    } catch (err) {
        return res.status(500).json({ err: "Server error" });


    }
}
const GetChannelDetail = async (req, res) => {
    res.status(200).json({ msg: 'Channel details' })


}
const CreateChannel = async (req, res) => {
    try {
        let NewChannel = req?.body?.NewChannel.trim()
        let ChannelExists = await ChannelModal.findOne({ name: NewChannel })
        if (ChannelExists) {
            return res.status(409).json({ err: 'Channel Already exists' })
        }

        let Channel = new ChannelModal({
            name: NewChannel,
            members: [req?.user?.id],
            createdBy: req?.user?.id


        })
        let Result = await Channel.save()
        console.log('Result', Result)

        res.status(200).json({ msg: 'JoinChannel' })
    } catch (err) {
        return res.status(500).json({ err: "Server error" });
    }



}
const JoinChannel = async (req, res) => {
    try {
        console.log(req?.body);
        console.log(req?.params);

        const { id } = req?.params;
        if (!id) {
            return res.status(409).json({ err: 'Id is missing' });
        }

        const channel = await ChannelModal.findById(id);
        if (!channel) {
            return res.status(401).json({ err: 'Channel Does Not Exist' });
        }
        if (channel.members.includes(req.user.id)) {
            return res.status(409).json({ err: 'You are already member of this channel' })
        }
        // Check if user is already a member
        if (!channel.members.includes(req.user.id)) {
            channel.members.push(req.user.id); // add user to members array
            await channel.save(); // save updated channel
        }

        console.log('Channel =', channel);
        res.status(200).json({ msg: 'Joined channel successfully', channel });
    } catch (err) {
        console.log('err', err);
        return res.status(500).json({ err: "Server error" });
    }
};

const IsMember = async (req, res) => {
    try {
        console.log('IsMember', req?.params?.id)
        let { id } = req?.params;
        if (!id) {
            return res.status(400).json({ err: "Id Does Not exists" });
        }

        let Result = await ChannelModal.findOne({ _id: id })
        let IsUserAlreadyMember = Result?.members.includes(req.user.id)
        console.log('IsUserAlreadyExists', IsUserAlreadyMember)

        res.status(200).json({ IsUserAlreadyMember: IsUserAlreadyMember })






    } catch (err) {
        return res.status(500).json({ err: "Server error" });

    }

}
const LeaveChannel = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ err: "Id is required" });
        }

        const channel = await ChannelModal.findById(id);

        if (!channel) {
            return res.status(404).json({ err: "Channel does not exist" });
        }

        // Remove user from members array
        channel.members = channel.members.filter(memberId =>
            memberId.toString() !== req.user.id.toString()
        );

        await channel.save();

        console.log("Updated members:", channel.members);

        return res.status(200).json({ msg: "Left channel successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ err: "Server error" });
    }
};
const GetAllUsers = async (req, res) => {
    try {
        console.log('req.params', req?.params)
        let Result = await ChannelModal.findOne({
            name: req?.params?.ActiveChannel
        }).populate('members')

        console.log('Result', Result)
        res.status(200).json({ msg: Result?.members })

    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ err: "Server error" });
    }
}

const GetAllMessages = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
const limit = Number(req.query.limit) || 20;   // default 20 messages
const skip = (page - 1) * limit;
let ChannelName=req?.query?.ChannelName.trim();
console.log('ChannelName',ChannelName)
let AllMessageslength = await MessageModal.find({roomName: ChannelName})
let NoOfPage = Math.ceil(AllMessageslength.length / limit);

        let AllMessages = await MessageModal.aggregate([
            {
                $match: { roomName: ChannelName }
            },
            {
                $sort: { _id: 1 }   // latest messages first
            },
            {
                $skip: skip          // (page-1)*limit
            },
            {
                $limit: limit
            }
        ]);


        res.status(200).json({ AllMessages: AllMessages,NoOfPage:NoOfPage })


    } catch (err) {
        console.error(err);
        return res.status(500).json({ err: "Server error" });
    }


}
export { GetAllMessages, GetAllUsers, IsMember, CreateChannel, GetUserDetails, GetAllChannel, JoinChannel, LeaveChannel, GetChannelDetail }