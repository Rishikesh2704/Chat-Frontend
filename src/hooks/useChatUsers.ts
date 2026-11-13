import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { setUsers } from "../redux/Chat/ChatSlice";
import { useGetUsersQuery } from "../redux/Chat/chatQuerySlice";
import { decryptMessage, deriveSharedKey } from "../utils/End2End";
import axiosInstance from "../lib/axios";

export default function useChatUser() {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.auth);
  const { data, isSuccess, error, isLoading, refetch } = useGetUsersQuery();

  async function transformConversation(
    friendsConvos: Conversation[],
    groupConvos: Conversation[],
    groups: Group[],
  ) {
    let friendsConversations = friendsConvos.map((convos: Conversation) => {
      if (!convos.isGroup && currentUser) {
        let participants = convos.participants.filter(
          (parti) => parti._id !== currentUser._id,
        );
        return {
          _id: participants[0]?._id,
          username: participants[0]?.username,
          profile: participants[0]?.profile,
          messagesCount: convos.unreadMessagesCount[currentUser._id],
          lastMessage: convos.lastMessage,
          updatedAt: convos.updatedAt,
        };
      }
    });
    const decryptFriendsConversations = await Promise.all(
      friendsConversations.map(
        async (convos) => await decryptConversationObject(convos),
      ),
    );

    let groupConversations = groupConvos.map((convos: Conversation) => {
      return {
        _id: convos.group?._id,
        groupName: convos.group?.groupName,
        admins: convos.group?.admins,
        members: convos.group?.members,
        profile: convos.group?.profile,
        roomId: convos.group?.roomId,
        lastMessage: convos.lastMessage,
        createdAt: convos.createdAt,
        updatedAt: convos.updatedAt,
      };
    });

    const filtered = groups.map((g: Group) => {
      const k = groupConversations.filter((c: any) => c._id == g._id);
      return k.length > 0 ? k : g;
    });
    // let conversations = [...data?.data?.Friends, ...data?.data?.Groups]
    return [...decryptFriendsConversations, ...filtered];
  }

  const decryptConversationObject  = async(conversation:any) => {
      if(!conversation) {
          console.log("Conversation is undefined");
          return;
      }
      const getPublicKey = await axiosInstance.get(`/users/publicKey/${conversation._id}`)
      const sharedSecret = await deriveSharedKey(getPublicKey.data.publicKey.publicKey)
      if(!sharedSecret) return 
      const {lastMessage} = conversation
      const decryptedMessage = await decryptMessage(lastMessage.message, sharedSecret, lastMessage.messageIv)
      const updatedLastMessage = {...lastMessage, message:decryptedMessage}
      const updatedConversation = {...conversation, lastMessage:updatedLastMessage}
      return updatedConversation
  }

  useEffect(() => {
    const friendsConvo =
      data?.Conversations.filter((u: Conversation) => !u.isGroup) || [];
    const groupsConvo =
      data?.Conversations.filter((u: Conversation) => u.isGroup) || [];
    const groups = data?.Groups || [];
    const Users = async () => {
      const userList = await transformConversation(
        friendsConvo,
        groupsConvo,
        groups,
      );
      dispatch(setUsers(userList));
    };
    Users();
  }, [isSuccess]);

  return { error, isLoading, refetch };
}
