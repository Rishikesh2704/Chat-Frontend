import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import axios from "../lib/axios";
import { setUsers } from "../redux/Slicers/ChatSlice";

export default function useChatUser() {
    const dispatch= useAppDispatch();
    const { currentUser } = useAppSelector(state => state.auth);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await axios.get(
          `${import.meta.env.VITE_API}/messages/users`,
          {
            withCredentials: true,
          },
        );
        console.log("Data: ", );
        let c = data?.data?.Conversations.filter((u:any) => !u.isGroup)
        let g = data?.data?.Conversations.filter((u:any) => u.isGroup);
        let friendsConversations = c.map((convos:any) => {
          if(!convos.isGroup) return {
            _id:convos.participants[1]?._id,
            username:convos.participants[1]?.username,
            profile:convos.participants[1]?.profile,
            lastMessage:convos.lastMessage,
            updatedAt:convos.updatedAt
          }
        })
        let groupConversations = g.map((convos:any) => {
           return {
            _id:convos.group?._id,
            groupName:convos.group?.groupName,
            profile:convos.group?.profile,
            roomId:convos.group.roomId,
            lastMessage:convos.lastMessage,
            updatedAt:convos.updatedAt
          }
        })
        let conversations = [...data?.data?.Friends, ...data?.data?.Groups]
        const userList = conversations;
        dispatch(setUsers(userList));
      } catch (error: any) {
        console.log(error);
      }
    };

    fetchUsers();
  }, []);
}
