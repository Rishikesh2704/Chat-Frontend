import type React from "react";
import { getDayOfMessages } from "../../../utils/MessagesDay";
import { toLocaleTime } from "../../../utils/MessagesTime";
import { useAppSelector } from "../../../redux/hooks";
import { getGroupSeenMembers } from "../../../utils/getGroupSeenMembers";
import { useRef, useState } from "react";
import { useOutsideElement } from "../../../hooks/useOutsideElement";

type propsType = {
  messages: AllMessageType;
  groupMembers: Map<string, { username: string; profile: string }> | undefined;
  previousMessageTime: React.RefObject<string>;
  handleDeleteMessage: (message: AllMessageType) => void;
};
export default function SentMessages(props: propsType) {
  const { messages, groupMembers, previousMessageTime, handleDeleteMessage } =
    props;
  const { currentUser } = useAppSelector((state) => state.auth);
  const { allMessages } = useAppSelector((state) => state.chat);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  let optionElementRef = useRef<any>(null);

  function closeOptions() {
    optionElementRef.current.nextElementSibling.classList.remove(
      "DisplayOptions",
    );
    setIsVisible(false);
  }

  useOutsideElement(optionElementRef, closeOptions);

  const isSeen = (messages: AllMessageType) => {
    const seenMessages = allMessages.filter((message) => message.seen === true);
    return seenMessages[seenMessages.length - 1]?._id === messages?._id;
  };

  const handleOptions = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    setIsVisible(true);
    const options = e.currentTarget.nextElementSibling as HTMLDivElement;
    console.log("Current Target", options);
    optionElementRef.current = e.target;
    options?.classList.add("DisplayOptions");
  };

  const handleMouseOver = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const hoverdMessage = e.currentTarget.children[2];
    hoverdMessage.classList.add("displayOptionBtn");
  };

  const handleMouseLeave = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    const hoverdMessage = e.currentTarget.children[2];
    hoverdMessage.classList.remove("displayOptionBtn");
  };

  return (
    <>
      <h6 className="Messages_Day">
        {getDayOfMessages(messages.createdAt, previousMessageTime)}
      </h6>
      <div
        className="SentMessages_Wrapper"
        onMouseOver={(e) => handleMouseOver(e)}
        onMouseLeave={(e) => (!isVisible ? handleMouseLeave(e) : null)}
      >
        <p className="sentTime time">{toLocaleTime(messages.createdAt)}</p>
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
            {messages.messageContent || messages.text}
            {!Array.isArray(messages.reactions) && messages.reactions && (
              <p className="PrivateMessage_reaction">{messages.reactions}</p>
            )}

            {Array.isArray(messages.reactions) &&
              messages.reactions.length > 0 && (
                <div className="Group_Reactions">
                  {messages.reactions.map((react) => (
                    <p className="reaction">{react.reaction}</p>
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
                {groupMembers &&
                  getGroupSeenMembers(
                    messages,
                    currentUser,
                    allMessages,
                    groupMembers,
                  )?.map((id: any) => (
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
        <div className="Options">
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
              Delete
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
