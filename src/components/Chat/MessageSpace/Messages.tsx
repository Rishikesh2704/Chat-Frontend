import { memo, useRef } from "react";

import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { setAllMessages } from "../../../redux/Slicers/ChatSlice";
import axios from "../../../lib/axios";

import ReceivedMessages from "./ReceivedMessages";
import SentMessages from "./SentMessages";
import { useUser } from "../../../lib/context";
import { isGroup } from "../../../utils/IsGroup";
import type { EmojiClickData } from "emoji-picker-react";

type propsType = {
  lastMessageRef: React.RefObject<HTMLDivElement | null>;
  groupMembers: Map<string, { username: string; profile: string }> | undefined;
};

const deleteMessageRequest = async (message: AllMessageType) => {
  const groupOrPrivate = Object.hasOwn(message, "groupId")
    ? "group"
    : "messages";
  const API = `${import.meta.env.VITE_API}/${groupOrPrivate}/deleteMessage/${message._id}`;
  return await axios.delete(API);
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

  const handleDeleteMessage = async (message: AllMessageType) => {
    try {
      const response = await deleteMessageRequest(message);
      if (response.status === 200) {
        const filteredMessages = allMessages.filter(
          (messages) => messages._id !== message._id,
        );
        dispatch(setAllMessages(filteredMessages));
      }
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
          userId: currentUser._id,
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
        userId: currentUser._id,
        roomId: selectedUser.roomId,
      });
    }
    socket?.emit("Delete_Reaction", { messageId, reaction: "" });
  };

  const isReceiver = (message: any) => {
    return message.SenderId !== currentUser?._id;
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
