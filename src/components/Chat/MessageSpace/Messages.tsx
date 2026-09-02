import type { EmojiClickData, EmojiStyle } from "emoji-picker-react";
import axios from "../../../lib/axios";
import EmojiPicker from "emoji-picker-react";
import { memo, useRef } from "react";
import type { Socket } from "socket.io-client";
import { useUser } from "../../../lib/context";
import { useAppSelector } from "../../../redux/hooks";

type propsType = {
  allMessages: AllMessageType[];
  setAllMessages: React.Dispatch<React.SetStateAction<AllMessageType[]>>;
  // selectedUser: User | Group;
  seenMessage: AllMessageType | null;
  lastMessageRef: React.RefObject<null>;
  groupMembers: Map<any, any> | undefined;
};

const isGroup = (user: User | Group): user is Group => {
  return "members" in user;
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

const deleteMessageRequest = async (message: AllMessageType) => {
  const groupOrPrivate = Object.hasOwn(message, "groupId")
    ? "group"
    : "messages";
  const API = `${import.meta.env.VITE_API}/${groupOrPrivate}/deleteMessage/${message._id}`;
  return await axios.delete(API);
};

export default memo(function Messages(props: propsType) {
  const {
    allMessages,
    setAllMessages,
    // selectedUser,
    seenMessage,
    lastMessageRef,
    groupMembers,
  } = props;

  const { selectedUser } = useAppSelector(state => state.chat)

  const { getUser, socket } = useUser();
  const previousMessageTime = useRef<string>("");
  
  if (!selectedUser) {
    console.log("No selected User");
    return;
  }
  // const socket = socketRef.current;
  const handleDeleteMessage = (message: AllMessageType) => {
    const deleteMessage = async () => {
      try {
        const response = await deleteMessageRequest(message);
        if (response.status === 200) {
          const filteredMessages = allMessages.filter(
            (messages) => messages._id !== message._id,
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
    if (isVisible) {
      reactionPicker.classList.remove("reactionVisible");
    } else {
      reactionPicker.classList.add("reactionVisible");
    }
  };

  const reactToMessage = (messageId: string, emojiObject: EmojiClickData) => {
    if (socket) {
      if (isGroup(selectedUser)) {
        socket.emit("Reacted_To_GroupMessage", {
          messageId,
          reaction: emojiObject.emoji,
          roomId: selectedUser.roomId,
          userId: getUser()._id,
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
    if (isGroup(selectedUser)) {
      socket?.emit("Delete_GroupMessage_Reaction", {
        messageId,
        userId: getUser()._id,
        roomId: selectedUser.roomId,
      });
    }
    socket?.emit("Delete_Reaction", { messageId, reaction: "" });
  };

  const isReceiver = (message: any) => {
    return message.SenderId !== getUser()?._id;
  };

  const isSeen = (messages: AllMessageType) => {
    const seenMessages = allMessages.filter((message) => message.seen === true);
    return seenMessages[seenMessages.length - 1]?._id === messages?._id;
  };

  const groupSeenMembers = (messages: AllMessageType) => {
    let seenProfile: string[] = [];
    const mess = messages.seen as string[];
    const seenMessage = mess.filter((m) => m !== getUser()._id);
    if (
      messages.SenderId !== getUser()._id &&
      !mess.includes(messages.SenderId)
    ) {
      mess.push(messages.SenderId);
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
                      {groupMembers?.get(messages.SenderId)?.username ||
                        (!isGroup(selectedUser) && selectedUser?.username)}
                    </p>
                  }
                  <div className="messageStyle received">
                    {messages.text}
                    {!Array.isArray(messages.reactions) &&
                      messages.reactions && (
                        <p
                          className="PrivateMessage_reaction"
                          onContextMenu={(e) =>
                            handleDeleteReaction(e, messages._id)
                          }
                        >
                          {messages.reactions}
                        </p>
                      )}
                    {Array.isArray(messages.reactions) &&
                      messages.reactions.length > 0 && (
                        <div className="Group_Reactions">
                          {messages.reactions.map((react) => (
                            <p
                              className="reaction"
                              onContextMenu={(e) =>
                                handleDeleteReaction(e, messages._id)
                              }
                            >
                              {react.reaction}
                            </p>
                          ))}
                        </div>
                      )}
                    
                  </div>
                </div>
                <div className="Message_details">
                  {Array.isArray(messages.seen) && (
                    <div className="Seen_GroupMembers">
                      {groupSeenMembers(messages)?.map((id) => (
                        <img
                          className="ReceivedMessage_Profile"
                          src={id}
                          width={18}
                          height={18}
                        ></img>
                      ))}
                    </div>
                  )}
                </div>

               {isGroup(selectedUser) && <img
                  className="ReceivedMessage_Profile"
                  src={groupMembers?.get(messages.SenderId)?.profile}
                  width={25}
                  height={25}
                />}

                <p className="receivedTime time">
                  {toLocaleTime(messages.createdAt)}
                </p>
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
                <p className="sentTime time">
                  {toLocaleTime(messages.createdAt)}
                </p>
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
                    {!Array.isArray(messages.reactions) &&
                      messages.reactions && (
                        <p
                          className="PrivateMessage_reaction"
                          onContextMenu={(e) =>
                            handleDeleteReaction(e, messages._id)
                          }
                        >
                          {messages.reactions}
                        </p>
                      )}

                    {Array.isArray(messages.reactions) &&
                      messages.reactions.length > 0 && (
                        <div className="Group_Reactions">
                          {messages.reactions.map((react) => (
                            <p
                              className="reaction"
                              onContextMenu={(e) =>
                                handleDeleteReaction(e, messages._id)
                              }
                            >
                              {react.reaction}
                            </p>
                          ))}
                        </div>
                      )}
                  </div>
                  <div className="Message_details">
                    {!Array.isArray(messages.seen) && isSeen(messages) && (
                      <p id="Seen_Message">Seen</p>
                    )}
                    {Array.isArray(messages.seen) && (
                      <div className="Seen_GroupMembers">
                        {groupSeenMembers(messages)?.map((id) => (
                          <img
                            className="ReceivedMessage_Profile"
                            src={id}
                            width={18}
                            height={18}
                          ></img>
                        ))}
                      </div>
                    )}
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
                    className="option_buttton"
                      aria-label="Delete"
                      onClick={() => handleDeleteMessage(messages)}
                    >
                      Delete <i className="fa-regular fa-trash-can"></i>
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
