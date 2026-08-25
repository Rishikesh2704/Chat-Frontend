import type { EmojiClickData, EmojiStyle } from "emoji-picker-react";
import axios from "../../../lib/axios";
import EmojiPicker from "emoji-picker-react";
import { memo, useRef } from "react";
import type { Socket } from "socket.io-client";
import { useUser } from "../../../lib/context";

type propsType = {
  allMessages: AllMessageType[];
  socketRef: React.RefObject<Socket | null>;
  setAllMessages: React.Dispatch<React.SetStateAction<AllMessageType[]>>;
  selectedUser: User | Group;
  seenMessage: AllMessageType | null;
  lastMessageRef: React.RefObject<null>;
};

function toLocaleTime(time: string) {
  return new Date(time).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const getDayOfMessages = (
  time: string,
  previousMessageTime: React.RefObject<string>,
) => {
  const date = new Date(time);
  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (
    isSameDay(date, new Date()) &&
    date.toLocaleDateString() !== previousMessageTime.current
  ) {
    previousMessageTime.current = date.toLocaleDateString();
    return "Today";
  }
  if (
    previousMessageTime.current.length === 0 ||
    previousMessageTime.current !== date.toLocaleDateString()
  ) {
    previousMessageTime.current = date.toLocaleDateString();
    const formattedDate =
      date.getDate() +
      " " +
      date.toLocaleString("default", { month: "long" }) +
      " " +
      date.getFullYear();
    return formattedDate;
  } else return "";
};

export default memo(function Messages(props: propsType) {
  const {
    allMessages,
    setAllMessages,
    socketRef,
    selectedUser,
    seenMessage,
    lastMessageRef,
  } = props;

  const { getUser } = useUser();
  const previousMessageTime = useRef<string>("");
  const socket = socketRef.current;
  const handleDeleteMessage = (messageId: string) => {
    const deleteMessage = async () => {
      try {
        const response = await axios.delete(
          `${import.meta.env.VITE_API}/messages/${messageId}`,
        );

        if (response.status === 200) {
          const filteredMessages = allMessages.filter(
            (messages) => messages._id !== messageId,
          );
          setAllMessages([...filteredMessages]);
        }
      } catch (error) {
        console.log(error);
      }
    };
    deleteMessage();
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

  const handleReactionEmojis = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    const reactionPicker = e.currentTarget.nextElementSibling as HTMLDivElement;
    const isVisible = reactionPicker.classList.contains("reactionVisible");
    console.log(reactionPicker);
    if (isVisible) {
      reactionPicker.classList.remove("reactionVisible");
    } else {
      reactionPicker.classList.add("reactionVisible");
    }
  };

  const reactToMessage = (messageId: string, emojiObject: EmojiClickData) => {
    if (socket) {
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
    socket?.emit("Delete_Reaction", { messageId, reaction: "" });
  };

  const isReceiver = (message: any) => {
    return typeof message.SenderId === "object"
      ? message.SenderId._id !== getUser()?._id
      : message.SenderId !== getUser()?._id;
  };

  const isSeen = (messages: AllMessageType): boolean => {
    const isGroup = Object.hasOwn(selectedUser, "roomId");
    if (isGroup) {
      return false;
    }
  
      const seenMessages = allMessages.filter(
        (message) => message.seen === true,
      );
      return seenMessages[seenMessages.length - 1]?._id === messages?._id;
    
  };
  return (
    <>
      {allMessages.map((messages: AllMessageType) => {
        if (getUser() && isReceiver(messages)) {
          return (
            <div key={messages._id}>
              <h6 className="Messages_Day">
                {getDayOfMessages(messages.createdAt, previousMessageTime)}
              </h6>
              <div
                className="ReceivedMessages_Wrapper"
                onMouseOut={(e) => handleHoverOut(e)}
              >
                <div className="Reactions">
                  <div
                    id="ReactionEmoji_Button"
                    aria-label="reaction emojis"
                    role="button"
                    onClick={(e) => handleReactionEmojis(e)}
                  >
                    <i className="fa-regular fa-face-grin"></i>
                  </div>
                  <div className="Reaction_Wrapper">
                    <EmojiPicker
                      className="Emojis_Main"
                      open={true}
                      emojiStyle={"native" as EmojiStyle}
                      reactionsDefaultOpen={true}
                      onEmojiClick={(emojiObject) =>
                        reactToMessage(messages._id, emojiObject)
                      }
                    />
                  </div>
                </div>
                <div
                  className="ReceivedText_Wrapper"
                  id={messages._id}
                  ref={lastMessageRef}
                >
                  {messages.image && (
                    <div className="messageimg_wrapper">
                      <img
                        className="message_img"
                        height={150}
                        width={250}
                        src={messages.image}
                      />
                    </div>
                  )}
                  {
                    <p className="GroupMessage_Username">
                      {(messages.SenderId.username as string) ||
                        selectedUser.username}
                    </p>
                  }
                  <div className="messageStyle received">
                    {messages.text}
                    {messages.reactions && (
                      <p
                        className="reaction"
                        onContextMenu={(e) =>
                          handleDeleteReaction(e, messages._id)
                        }
                      >
                        {messages.reactions}
                      </p>
                    )}
                  </div>
                  <p className="receivedTime time">
                    {toLocaleTime(messages.createdAt)}
                  </p>
                </div>
                {typeof messages.SenderId === "object" && (
                  <img
                    className="ReceivedMessage_Profile"
                    src={messages?.SenderId?.profile}
                    width={25}
                    height={25}
                  />
                )}
              </div>
            </div>
          );
        } else {
          return (
            <>
              <h6 className="Messages_Day">
                {getDayOfMessages(messages.createdAt, previousMessageTime)}
              </h6>
              <div className="SentMessages_Wrapper">
                <div className="SentText_Wrapper">
                  {messages.image && (
                    <div className="messageimg_wrapper">
                      <img
                        className="message_img"
                        height={150}
                        width={250}
                        src={messages.image}
                      />
                    </div>
                  )}
                  <div className="messageStyle ">
                    {messages.text}
                    {messages.reactions && (
                      <p className="reaction sentMessage_reaction">
                        {messages.reactions}
                      </p>
                    )}
                  </div>
                  <div className="Message_details">
                    <p className="sentTime time">
                      {toLocaleTime(messages.createdAt)}
                    </p>

                    {isSeen(messages) && <p id="Seen_Message">Seen</p>}
                  </div>
                </div>
                <div
                  className="Options"
                  onMouseLeave={(e) => handleMouseLeave(e)}
                >
                  <i
                    className="fa-solid fa-ellipsis-vertical"
                    onClick={(e) => handleOptions(e)}
                  ></i>
                  <div className="option">
                    <button
                      aria-label="Delete"
                      onClick={() => handleDeleteMessage(messages._id)}
                    >
                      <i className="fa-regular fa-trash-can"></i>
                    </button>
                  </div>
                </div>
              </div>
            </>
          );
        }
      })}
    </>
  );
});
