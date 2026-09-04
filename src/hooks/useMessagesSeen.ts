import { useEffect } from "react";
import { useUser } from "../lib/context";
import { useAppSelector } from "../redux/hooks";
import { isGroup } from "../utils/IsGroup";

export default function useMessagesSeen(lastMessageRef:React.RefObject<null>) {
    const { socket } = useUser();
    const { selectedUser, allMessages } = useAppSelector(state => state.chat)
    const { currentUser } = useAppSelector(state => state.auth);

  useEffect(() => {
    if (!socket) return;
    if (!selectedUser) return;

    const messages = document.querySelectorAll(".ReceivedText_Wrapper");
    const groupMessageSeenHandler = (message: AllMessageType | undefined) => {
      const seen = message?.seen as string[];
      if (seen.includes(currentUser._id)) return;
      socket.emit(
        "groupMessage_Seen",
        message,
        currentUser,
        isGroup(selectedUser) ? selectedUser.roomId : "",
      );
    };

    const privateMessageSeenHandler = (message: AllMessageType | undefined) => {
      if (allMessages[allMessages.length - 1].seen) return;
      socket.emit("Seen_Message", message);
    };

    const observerFunction = (entries: any) => {
      entries.forEach((entry: any) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          const isGroup = Object.hasOwn(selectedUser, "roomId");
          const message = allMessages.find((message) => message._id == id);
          if (isGroup) groupMessageSeenHandler(message);
          else privateMessageSeenHandler(message);
        }
      });
    };

    const observer = new IntersectionObserver(observerFunction, {
      root: null,
      rootMargin: "0px",
      threshold: 1.0,
    });

    if (lastMessageRef.current) {
      observer.observe(lastMessageRef.current);
    }
    messages.forEach((message) => observer.observe(message));
    return () => {
      observer.disconnect();
    };
  }, [allMessages]);
}
