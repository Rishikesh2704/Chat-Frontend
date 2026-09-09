import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAppSelector } from "../redux/hooks";

type UserContextType = {
  socket: any;
};

const userContextState = {
  socket: null,
};
const userContext = createContext<UserContextType>(userContextState);

export const useUser = () => useContext(userContext);

export const User = ({ children }: { children: React.ReactNode }) => {
  const { currentUser: user } = useAppSelector((state) => state.auth);

  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!user) return;

    const newSocket = io(import.meta.env.VITE_API, {
      query: { userId: user?._id, username: user?.username },
    });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, [user]);


  const value = {
    socket,
  };
  return <userContext.Provider value={value}>{children}</userContext.Provider>;
};
