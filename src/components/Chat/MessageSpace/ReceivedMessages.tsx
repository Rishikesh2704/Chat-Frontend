import type { EmojiClickData, EmojiStyle } from "emoji-picker-react";
import { useUser } from "../../../lib/context";
import { isGroup } from "../../../utils/IsGroup";
import { getDayOfMessages } from "../../../utils/MessagesDay";
import { useAppSelector } from "../../../redux/hooks";
import EmojiPicker from "emoji-picker-react";
import { toLocaleTime } from "../../../utils/MessagesTime";
import { getGroupSeenMembers } from "../../../utils/getGroupSeenMembers";

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

  return (
    <div key={messages._id}>
      <h6 className="Messages_Day">
        {getDayOfMessages(messages.createdAt, previousMessageTime)}
      </h6>
      <div className="ReceivedMessages_Wrapper">
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
                (selectedUser &&
                  !isGroup(selectedUser) &&
                  selectedUser?.username)}
            </p>
          }
          <div className="messageStyle received">
            {messages.text}
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
            src={groupMembers?.get(messages.SenderId)?.profile}
            width={25}
            height={25}
          />
        )}

        <p className="receivedTime time">{toLocaleTime(messages.createdAt)}</p>
      </div>
    </div>
  );
}
