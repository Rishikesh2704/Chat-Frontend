import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import axios from "../lib/axios";
import { prependMessages, setAllMessages } from "../redux/Slicers/ChatSlice";

export default function useChatMessages(
  MessageSpaceRef: React.RefObject<HTMLDivElement | null>,
  scrollPosRef: React.RefObject<number | null>,
  setIsTop: React.Dispatch<React.SetStateAction<boolean>>,
) {
  const { currentUser } = useAppSelector((state) => state.auth);
  const { selectedUser, allMessages } = useAppSelector((state) => state.chat);
  const dispatch = useAppDispatch();

  const skipMessages = useRef(0);
  const loadingRef = useRef(false);


  const fetchMessages = async (
    selectedUser: User | Group,
    skipMessages: number,
    currentUser: User | null,
  ) => {
    if (!currentUser || !selectedUser) {
      console.log(
        "Current User:",
        currentUser,
        "\n Selected User:",
        selectedUser,
      );
      return;
    }
    const isGroup = Object.hasOwn(selectedUser, "roomId");
    const UserMessageAPI = `${import.meta.env.VITE_API}/messages/${selectedUser._id}/${skipMessages}`;
    const response = await axios.get(UserMessageAPI);
    const reversed = isGroup
      ? response.data.groupMessages.toReversed()
      : response.data.messages.toReversed();
    return reversed;
  };

  useEffect(() => {
    if (!selectedUser) return;

    const setRecentMessages = async () => {
      try {
        const messages = await fetchMessages(
          selectedUser,
          skipMessages.current,
          currentUser,
        );

        dispatch(setAllMessages(messages));
      } catch (error) {
        console.log(error);
      }
    };

    setRecentMessages();
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
        const messages1 = await fetchMessages(
          selectedUser,
          skipMessages.current,
          currentUser,
        );
        console.log("effect : ", allMessages);
        console.log("recent : ", messages1);
        dispatch(prependMessages(messages1));
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
        !loadingRef.current
      ) {
        setIsTop(true);
        console.log("Messages Length", allMessages);
        console.log("Fetch More Recent Messages");

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
}
