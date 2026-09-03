import type { EmojiClickData, EmojiStyle } from "emoji-picker-react";
import axios from "../../../lib/axios";
import EmojiPicker from "emoji-picker-react";
import { memo, useRef } from "react";
import type { Socket } from "socket.io-client";
import { useUser } from "../../../lib/context";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { setAllMessages } from "../../../redux/Slicers/ChatSlice";
import ReceivedMessages from "./ReceivedMessages";
import SentMessages from "./SentMessages";

type propsType = {
  lastMessageRef: React.RefObject<null>;
  groupMembers: Map<any, any> | undefined;
};

const isGroup = (user: User | Group): user is Group => {
  return "members" in user;
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

  const { currentUser } = useAppSelector((state) => state.auth);
  const { selectedUser, allMessages } = useAppSelector((state) => state.chat);
  const dispatch = useAppDispatch();

  const { socket } = useUser();
  const previousMessageTime = useRef<string>("");

  if (!selectedUser) {
    console.log("No selected User");
    return;
  }

  const isSeen = (messages: AllMessageType) => {
    const seenMessages = allMessages.filter((message) => message.seen === true);
    return seenMessages[seenMessages.length - 1]?._id === messages?._id;
  };

  const groupSeenMembers = (messages: AllMessageType) => {
    let seenProfile: string[] = [];
    let mess = messages.seen as string[];
    const seenMessage = mess.filter((m) => m !== currentUser._id);
    if (
      messages.SenderId !== currentUser._id &&
      !mess.includes(messages.SenderId)
    ) {
      // mess.push(messages.SenderId);
    }
    if (seenMessage.length < 1) return [];
    const latestMessage = allMessages[allMessages.length - 1];
    const latestMessageSeenArray = latestMessage.seen as string[];
    if (latestMessage._id == messages._id) {
      let seenProfile = seenMessage.map(
        (mem) => groupMembers?.get(mem)?.profile,
      );
      return seenProfile;
    }
    seenMessage.forEach((mem) => {
      !latestMessageSeenArray.includes(mem) ? seenProfile.push(mem) : null;
    });

    let messageIndex = allMessages.findIndex(
      (mess) => mess._id === messages._id,
    );
    if (messageIndex + 1 === allMessages.length) return seenProfile;

    let nextMesssage = allMessages[messageIndex + 1];
    const nextMessageSeenArray = nextMesssage.seen as string[];
    const updatedSeenProfile: string[] = [];

    seenProfile.forEach((mem) => {
      !nextMessageSeenArray.includes(mem)
        ? updatedSeenProfile.push(groupMembers?.get(mem).profile)
        : null;
    });

    return updatedSeenProfile;
  };

  const handleDeleteMessage = (message: AllMessageType) => {
    const deleteMessage = async () => {
      try {
        const response = await deleteMessageRequest(message);
        if (response.status === 200) {
          const filteredMessages = allMessages.filter(
            (messages) => messages._id !== message._id,
          );
          dispatch(setAllMessages([...filteredMessages]));
        }
      } catch (error) {
        console.log(error);
      }
    };
    deleteMessage();
  };

  const handleReactionEmojis = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    const reactionPicker = e.currentTarget.nextElementSibling as HTMLDivElement;
    const isVisible = reactionPicker.classList.contains("reactionVisible");
    if (isVisible) {
      reactionPicker.classList.remove("reactionVisible");
    } else {
      reactionPicker.classList.add("reactionVisible");
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

  const handleHoverOut = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    // console.log(e.currentTarget.children[0].children[0])
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

  const handleOptions = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    const options = e.currentTarget.nextElementSibling as HTMLDivElement;
    options?.style.setProperty("--displayOptions", "block");
  };

  const handleMouseLeave = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    const optiions = e.currentTarget.lastChild as HTMLDivElement;
    optiions.style.setProperty("--displayOptions", "none");
  };

  return (
    <>
      {allMessages.map((messages: AllMessageType) => {
        if (currentUser && isReceiver(messages)) {
          return (
            <ReceivedMessages
              messages={messages}
              previousMessageTime={previousMessageTime}
              lastMessageRef={lastMessageRef}
              groupMembers={groupMembers}
              groupSeenMembers={groupSeenMembers}
              handleDeleteReaction={handleDeleteReaction}
              reactToMessage={reactToMessage}
              handleReactionEmojis={handleReactionEmojis}
              handleHoverOut={handleHoverOut}
            />
          );
        } else {
          return (
            <SentMessages
              messages={messages}
              previousMessageTime={previousMessageTime}
              groupSeenMembers={groupSeenMembers}
              handleOptions={handleOptions}
              handleMouseLeave={handleMouseLeave}
              isSeen={isSeen}
              handleDeleteMessage={handleDeleteMessage}
            />
          );
        }
      })}
    </>
  );
});
