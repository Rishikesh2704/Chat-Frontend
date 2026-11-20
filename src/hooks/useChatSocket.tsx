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
import { toast } from "react-toastify";
import { setVideoCallModal } from "../redux/Modal/ModalSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faPhoneSlash } from "@fortawesome/free-solid-svg-icons";
export default function useChatSocket(setIsTyping: any) {
  const { currentUser } = useAppSelector((state) => state.auth);
  const { users, selectedUser } = useAppSelector((state) => state.chat);

  const { socket } = useUser();

  const dispatch = useAppDispatch();

  const VideoCallAcceptBtn = ({
    from,
    roomId,
    user,
    closeToast,
  }: {
    from: any;
    roomId: any;
    user: any;
    closeToast: () => void;
  }) => (
    <div className="call_btns">
      <button
        className="btn answerCall"
        onClick={() => {
          socket.emit("join_videoRoom", { roomId, username: user.username });
          closeToast();
          dispatch(setVideoCallModal(true));
        }}
      >
        <FontAwesomeIcon icon={faPhone} />
      </button>
      <button
        className="btn cancelCall"
        onClick={() => {
          const user = {
            _id: currentUser?._id,
            username: currentUser?.username,
            profile: currentUser?.profile,
          };
          socket.emit("CallRequest_Rejected", { to: from, user });
          closeToast();
        }}
      >
        <FontAwesomeIcon icon={faPhoneSlash} />
      </button>
    </div>
  );

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
      if (!sharedSecret) return;

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
    if (!socket) {
      console.log("Empty Socket");
      return;
    }
    const handleVideoCallRequest = (data: any) => {
      const { from, roomId, user } = data;
      toast(`Call from ${user.username}`, {
        position: "top-center",
        autoClose: false,
        closeButton: (
          <VideoCallAcceptBtn
            from={from}
            roomId={roomId}
            user={user}
            closeToast={() => close()}
          ></VideoCallAcceptBtn>
        ),
      });
    };

    socket.on("VideoCall_Request", handleVideoCallRequest);

    return () => {
      socket.off("VideoCall_Request", handleVideoCallRequest);
    };
  }, [socket, currentUser]);

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
