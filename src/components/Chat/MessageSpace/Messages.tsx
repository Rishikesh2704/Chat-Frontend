import { memo, useRef } from "react";

import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import {
  deleteMessage,
  updateUserConversation,
} from "../../../redux/Chat/ChatSlice";

import ReceivedMessages from "./ReceivedMessages";
import SentMessages from "./SentMessages";
import { useUser } from "../../../lib/context";
import { isGroup } from "../../../utils/IsGroup";
import type { EmojiClickData } from "emoji-picker-react";
import { useDeleteMessagesMutation } from "../../../redux/Chat/chatQuerySlice";

type propsType = {
  lastMessageRef: React.RefObject<HTMLDivElement | null>;
  groupMembers: Map<string, { username: string; profile: string }> | undefined;
};

export default memo(function Messages(props: propsType) {
  const { lastMessageRef, groupMembers } = props;

  const { socket } = useUser();
  const { currentUser } = useAppSelector((state) => state.auth);
  const { selectedUser, allMessages } = useAppSelector((state) => state.chat);

  const dispatch = useAppDispatch();

  const previousMessageTime = useRef<string>("");

  if (!selectedUser) {
    console.log("No selected User");
    return;
  }

  const [deleteMessageRequest] = useDeleteMessagesMutation();

  const handleDeleteMessage = async (message: AllMessageType) => {
    try {
      const groupOrPrivate = Object.hasOwn(message, "groupId")
        ? "group"
        : "messages";
      const response = await deleteMessageRequest({
        type: groupOrPrivate,
        messageId: message._id,
      }).unwrap();
      dispatch(updateUserConversation(response?.conversation));
      dispatch(deleteMessage(message));
    } catch (error) {
      console.log(error);
    }
  };

  const reactToMessage = (messageId: string, emojiObject: EmojiClickData) => {
    if (socket) {
      if (selectedUser && isGroup(selectedUser)) {
        socket.emit("Reacted_To_GroupMessage", {
          messageId,
          reaction: emojiObject.emoji,
          roomId: selectedUser.roomId,
          userId: currentUser && currentUser._id,
        });
        return;
      }

      socket.emit("Reacted_To_Message", {
        messageId,
        reaction: emojiObject.emoji,
      });
    }
  };

  const handleDeleteReaction = (
    e: React.MouseEvent<HTMLParagraphElement, MouseEvent>,
    messageId: string,
  ) => {
    e.preventDefault();
    if (selectedUser && isGroup(selectedUser)) {
      socket?.emit("Delete_GroupMessage_Reaction", {
        messageId,
        userId: currentUser && currentUser._id,
        roomId: selectedUser.roomId,
      });
    }
    socket?.emit("Delete_Reaction", { messageId, reaction: "" });
  };

  const isReceiver = (message: any) => {
    return message.senderId !== currentUser?._id;
  };

  return (
    <>
      {allMessages.map((messages: AllMessageType) => {
        if (currentUser && isReceiver(messages)) {
          return (
            <ReceivedMessages
              key={messages._id}
              messages={messages}
              previousMessageTime={previousMessageTime}
              lastMessageRef={lastMessageRef}
              groupMembers={groupMembers}
              reactToMessage={reactToMessage}
              handleDeleteReaction={handleDeleteReaction}
            />
          );
        } else {
          return (
            <SentMessages
              key={messages._id}
              messages={messages}
              groupMembers={groupMembers}
              previousMessageTime={previousMessageTime}
              handleDeleteMessage={handleDeleteMessage}
            />
          );
        }
      })}
    </>
  );
});
