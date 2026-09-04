import type React from "react";
import { getDayOfMessages } from "../../../utils/MessagesDay";
import { toLocaleTime } from "../../../utils/MessagesTime";
import { useAppSelector } from "../../../redux/hooks";
import { getGroupSeenMembers } from "../../../utils/getGroupSeenMembers";

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

  const isSeen = (messages: AllMessageType) => {
    const seenMessages = allMessages.filter((message) => message.seen === true);
    return seenMessages[seenMessages.length - 1]?._id === messages?._id;
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
      <h6 className="Messages_Day">
        {getDayOfMessages(messages.createdAt, previousMessageTime)}
      </h6>
      <div className="SentMessages_Wrapper">
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
            {messages.text}
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
        <div className="Options" onMouseLeave={(e) => handleMouseLeave(e)}>
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
