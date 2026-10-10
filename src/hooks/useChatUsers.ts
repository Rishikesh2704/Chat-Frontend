import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import axios from "../lib/axios";
import { setUsers } from "../redux/Chat/ChatSlice";

export default function useChatUser() {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.auth);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await axios.get(
          `${import.meta.env.VITE_API}/messages/users`,
          {
            withCredentials: true,
          },
        );
        let c = data?.data?.Conversations.filter(
          (u: Conversation) => !u.isGroup,
        );
        let g = data?.data?.Conversations.filter(
          (u: Conversation) => u.isGroup,
        );
        let friendsConversations = c.map((convos: Conversation) => {
          if (!convos.isGroup){
            let participants = convos.participants.filter(parti => parti._id !== currentUser._id) 
            return {
              _id: participants[0]?._id,
              username:participants[0]?.username,
              profile:participants[0]?.profile,
              lastMessage: convos.lastMessage,
              updatedAt: convos.updatedAt,
            };}
        });
        let groupConversations = g.map((convos: Conversation) => {
          return {
            _id: convos.group?._id,
            groupName: convos.group?.groupName,
            profile: convos.group?.profile,
            roomId: convos.group?.roomId,
            lastMessage: convos.lastMessage,
            updatedAt: convos.updatedAt,
          };
        });
        const groups = data?.data?.Groups;
        const filtered = groups.map((g: Group) => {
          const k = groupConversations.filter((c: Group) => c._id == g._id);
          return k.length > 0 ? k : g;
        });
        // let conversations = [...data?.data?.Friends, ...data?.data?.Groups]
        let conversations = [...friendsConversations, ...filtered];
        const userList = conversations;
        dispatch(setUsers(userList));
      } catch (error: any) {
        console.log(error);
      }
    };

    fetchUsers();
  }, []);
}
