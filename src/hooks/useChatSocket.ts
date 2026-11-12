import { useEffect } from "react";
import {
  addNewMessage,
  setOnlineUsers,
  updateReaction,
  updateSeenMessage,
  updateUserConversation,
} from "../redux/Chat/ChatSlice";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { useUser } from "../lib/context";
import { isGroup } from "../utils/IsGroup";
import { decryptMessage, deriveSharedKey } from "../utils/End2End";
import axiosInstance from "../lib/axios";

export default function useChatSocket(setIsTyping: any) {
  const { currentUser } = useAppSelector((state) => state.auth);
  const { users, selectedUser } = useAppSelector((state) => state.chat);

  const { socket } = useUser();

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!socket || !currentUser) return;

    socket.emit("connected");

    const handleIsTyping = (user: any) => {
      if (user.typerId === currentUser._id) return;
      setIsTyping({ id: user.typerId, isTyping: user.isTyping });
    };

    const handleSeenMessage = (message: AllMessageType) =>
      dispatch(updateSeenMessage(message));

    const handleGroupSeenMessages = (message: AllMessageType) =>
      dispatch(updateSeenMessage(message));

    const handleReaction = (message: AllMessageType) =>
      dispatch(updateReaction(message));

    const handleGroupMessageReaction = (message: AllMessageType) =>
      dispatch(updateReaction(message));

    const handleDeleteReaction = (message: any) =>
      dispatch(updateReaction(message));

    const handleDeleteGroupReaction = (message: AllMessageType) =>
      dispatch(updateReaction(message));

    const groupMessageHandler = (message: AllMessageType, ack: any) => {
      ack(true);
      if (message.senderId !== currentUser?._id) {
        dispatch(addNewMessage(message));
      }
    };

    const onlineUsersHandler = (UsersList: any) => {
      dispatch(setOnlineUsers(UsersList));
    };

    const privateMessageHandler = async (
      message: {
        conversation: Conversation;
        savedMessage: AllMessageType;
        key: string;
        iv: any;
      },
      ack: any,
    ) => {
      ack(true);
      const senderId = message.savedMessage.senderId;
      const getPublicKey = await axiosInstance.get(
        `/users/publicKey/${senderId}`,
      );
      const publicKey = getPublicKey.data.publicKey;
      const sharedSecret = await deriveSharedKey(publicKey.publicKey);
      if(!sharedSecret)return;

      const decryptedMessage = await decryptMessage(
        message.savedMessage.messageContent,
        sharedSecret,
        message.iv,
      );
      if (!decryptedMessage) return;
      const decryptedMessagObject = {
        ...message.savedMessage,
        messageContent: decryptedMessage,
      };

      const lastMessage = {
        ...message.conversation.lastMessage,
        message: decryptedMessage,
      };
      const decryptedMessageConversation = {
        ...message.conversation,
        lastMessage,
      };

      if (message.savedMessage.senderId !== selectedUser?._id) {
        dispatch(
          updateUserConversation({
            conversation: decryptedMessageConversation,
            currentUser,
          }),
        );
        return;
      }
      dispatch(addNewMessage(decryptedMessagObject));
      dispatch(
        updateUserConversation({
          conversation: decryptedMessageConversation,
          currentUser,
        }),
      );
    };

    const afterDisconnectedUsers = (onlineUsers: any) => {
      dispatch(setOnlineUsers(onlineUsers));
    };

    socket.on("Online_Users", onlineUsersHandler);
    socket.on("groupMessage", groupMessageHandler);
    socket.on("privateMessage", privateMessageHandler);
    socket.on("AfterDisconnection_Online_Users", afterDisconnectedUsers);

    socket.on("Typing", handleIsTyping);
    socket.on("Seen_Message", handleSeenMessage);
    socket.on("SeenBy_GroupMembers", handleGroupSeenMessages);
    socket.on("Reaction_Update", handleReaction);
    socket.on("Reaction_For_GroupMessage", handleGroupMessageReaction);
    socket.on("Deleted_Reaction", handleDeleteReaction);
    socket.on("Deleted_GroupMessage_Reaction", handleDeleteGroupReaction);

    return () => {
      socket.off("groupMessage", groupMessageHandler);
      socket.off("Online_Users", onlineUsersHandler);
      socket.off("privateMessage", privateMessageHandler);
      socket.off("AfterDisconnection_Online_Users", afterDisconnectedUsers);

      socket.off("Typing", handleIsTyping);
      socket.off("Seen_Message", handleSeenMessage);
      socket.off("SeenBy_GroupMembers", handleGroupSeenMessages);
      socket.off("Reaction_Update", handleReaction);
      socket.off("Reaction_For_GroupMessage", handleGroupMessageReaction);
      socket.off("Deleted_Reaction", handleDeleteReaction);
      socket.off("Deleted_GroupMessage_Reaction", handleDeleteGroupReaction);
    };
  }, [socket, currentUser?._id, selectedUser?._id]);

  useEffect(() => {
    if (!users) {
      console.log("No Users Found: ");
      return;
    }

    const groupRoomIds = users
      .filter((user) => isGroup(user))
      .map((group) => group.roomId);
    if (groupRoomIds.length > 0) {
      groupRoomIds.forEach((room) => {
        socket.emit("join_group", room);
      });
    }
  }, [users]);
}
