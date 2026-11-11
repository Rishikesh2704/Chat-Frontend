import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { prependMessages, setAllMessages } from "../redux/Chat/ChatSlice";
import { useGetMessagesMutation } from "../redux/Chat/chatQuerySlice";
import { decryptMessage, deriveSharedKey } from "../utils/End2End";
import { isGroup } from "../utils/IsGroup";

export default function useChatMessages(
  MessageSpaceRef: React.RefObject<HTMLDivElement | null>,
  scrollPosRef: React.RefObject<number | null>,
  setIsTop: React.Dispatch<React.SetStateAction<boolean>>,
) {
  const { selectedUser } = useAppSelector((state) => state.chat);
  const dispatch = useAppDispatch();

  const skipMessages = useRef(0);
  const loadingRef = useRef(false);

  // const fetchMessages = async (
  //   selectedUser: User | Group,
  //   skipMessages: number,
  // ) => {
  //   if (!selectedUser) {
  //     console.log(" Selected User:", selectedUser);
  //     return;
  //   }
  //   // const isGroup = Object.hasOwn(selectedUser, "roomId");
  //   const UserMessageAPI = `${import.meta.env.VITE_API}/messages/${selectedUser._id}/${skipMessages}`;
  //   const response = await axiosInstance.get(UserMessageAPI);
  //   // const reversed = isGroup
  //   //   ? response.data.groupMessages.toReversed()
  //   //   : response.data.messages.toReversed();
  //   const reversed = response.data.messages.toReversed();
  //   return reversed;
  // };

  const [getMessages, { isLoading, isError }] = useGetMessagesMutation();

  useEffect(() => {
    if (!selectedUser) return;
    const fetch = async () => {
      try {
        const data = await getMessages({
          selectedUserId: selectedUser._id,
          skipMessages: skipMessages.current,
        }).unwrap();
        [];
        if (!isGroup(selectedUser) && selectedUser.publicKey) {
        let sharedSecret = await deriveSharedKey(
            selectedUser.publicKey.publicKey,
          );
          if (!sharedSecret) return;
          let decryptedMessages = data.map(
            async (encryptedMessage: AllMessageType) => {
              const decryptedMessage = await decryptMessage(
                encryptedMessage.messageContent,
                sharedSecret,
                encryptedMessage.iv,
              );
              const decryptedMessageObject = {
                ...encryptedMessage,
                messageContent: decryptedMessage,
              };
              return decryptedMessageObject;
            },
          );
          let messages = await Promise.all(decryptedMessages);
          dispatch(setAllMessages(messages));
          return;
        }
        dispatch(setAllMessages(data));
      } catch (error) {
        console.log("Failed to fetch recent messages: ", error);
      }
    };
    fetch();

    return () => {
      dispatch(setAllMessages([]));
      skipMessages.current = 0;
    };
  }, [selectedUser]);

  //Fetch Recent Messages
  useEffect(() => {
    if (!selectedUser) return;
    const messageSpaceDiv = MessageSpaceRef.current;

    if (!messageSpaceDiv) return;
    messageSpaceDiv.scrollTop = messageSpaceDiv.scrollHeight;

    const MoreRecentMessages = async () => {
      loadingRef.current = true;
      try {
        const data = await getMessages({
          selectedUserId: selectedUser._id,
          skipMessages: skipMessages.current,
        }).unwrap();
        dispatch(prependMessages(data));
      } catch (error) {
        console.log(error);
      } finally {
        loadingRef.current = false;
      }
    };

    const windw = () => {
      if (
        Math.floor(messageSpaceDiv.scrollTop) >= 1 &&
        Math.floor(messageSpaceDiv.scrollTop) <= 5 &&
        // allMessages.length > 15 &&
        !loadingRef.current
      ) {
        setIsTop(true);

        scrollPosRef.current = messageSpaceDiv.scrollHeight;
        skipMessages.current += 15;

        MoreRecentMessages();
      }
    };

    messageSpaceDiv.addEventListener("scroll", windw);

    return () => {
      messageSpaceDiv.removeEventListener("scroll", windw);
      dispatch(setAllMessages([]));
      skipMessages.current = 0;
    };
  }, [selectedUser]);

  return { isLoading, isError };
}
