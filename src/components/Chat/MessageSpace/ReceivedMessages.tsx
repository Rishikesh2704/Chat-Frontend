import type { EmojiClickData, EmojiStyle } from "emoji-picker-react";
import { isGroup } from "../../../utils/IsGroup";
import { getDayOfMessages } from "../../../utils/MessagesDay";
import { useAppSelector } from "../../../redux/hooks";
import EmojiPicker from "emoji-picker-react";
import { toLocaleTime } from "../../../utils/MessagesTime";
import { getGroupSeenMembers } from "../../../utils/getGroupSeenMembers";
import { useRef, useState } from "react";
import { useOutsideElement } from "../../../hooks/useOutsideElement";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFaceGrin } from "@fortawesome/free-regular-svg-icons";

type propsType = {
  messages: AllMessageType;
  previousMessageTime: React.RefObject<string>;
  lastMessageRef: React.RefObject<HTMLDivElement | null>;
  groupMembers: Map<any, any> | undefined;
  reactToMessage: (messageId: string, emojiObject: EmojiClickData) => void;
  handleDeleteReaction: (
    e: React.MouseEvent<HTMLParagraphElement, MouseEvent>,
    messageId: string,
  ) => void;
};
export default function ReceivedMessages(props: propsType) {
  const {
    messages,
    previousMessageTime,
    lastMessageRef,
    groupMembers,
    reactToMessage,
    handleDeleteReaction,
  } = props;

  const { currentUser } = useAppSelector((state) => state.auth);
  const { selectedUser, allMessages } = useAppSelector((state) => state.chat);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  let reactionRef = useRef<any>(null);

  useOutsideElement(reactionRef, closeReactionOption);

  function closeReactionOption() {
    reactionRef.current.parentElement.nextElementSibling.classList.remove(
      "reactionVisible",
    );
    setIsVisible(false);
  }

  const handleReactionEmojis = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    const reactionPicker = e.currentTarget.nextElementSibling as HTMLDivElement;
    const doesContain = reactionPicker.classList.contains("reactionVisible");
    setIsVisible((prev) => !prev);
    reactionRef.current = e.target;
    if (doesContain) {
      reactionPicker.classList.remove("reactionVisible");
    } else {
      reactionPicker.classList.add("reactionVisible");
    }
  };

  const handleMouseOver = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const hoverdMessage = e.currentTarget.children[0];
    hoverdMessage.classList.add("displayReactionBtn");
  };

  const handleMouseLeave = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    const hoverdMessage = e.currentTarget.children[0];
    hoverdMessage.classList.remove("displayReactionBtn");
  };
  return (
    <div key={messages._id}>
      <h2 className="Messages_Day">
        {getDayOfMessages(messages.createdAt, previousMessageTime)}
        <p className="visually-hidden">day</p>
      </h2>
      <div
        className="ReceivedMessages_Wrapper"
        onMouseOver={(e) => handleMouseOver(e)}
        onMouseLeave={(e) => (!isVisible ? handleMouseLeave(e) : null)}
      >
        <div className="Reactions">
          <div
            id="ReactionEmoji_Button"
            aria-label="reaction emojis"
            role="button"
            onClick={(e) => handleReactionEmojis(e)}
          >
            <FontAwesomeIcon icon ={faFaceGrin}/>
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
              {groupMembers?.get(messages.senderId)?.username ||
                (selectedUser &&
                  !isGroup(selectedUser) &&
                  selectedUser?.username)}
            </p>
          }
          <div className="messageStyle received">
            { messages.messageContent}
            {!Array.isArray(messages.reactions) && messages.reactions && (
              <p
                className="PrivateMessage_reaction"
                onContextMenu={(e) => handleDeleteReaction(e, messages._id)}
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

        {selectedUser && isGroup(selectedUser) && (
          <img
            className="ReceivedMessage_Profile"
            src={groupMembers?.get(messages.senderId)?.profile}
            width={25}
            height={25}
          />
        )}

        <p className="receivedTime time">{toLocaleTime(messages.createdAt)}</p>
      </div>
    </div>
  );
}
