import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { io, type Socket } from "socket.io-client";

type User = {
  [index: string]: string;
};

type UserContextType = {
  onlineUsers: User[] | null;
  setOnlineUsers: React.Dispatch<React.SetStateAction<User[] | null>>;
  // socketRef: React.RefObject<Socket | null>;
  // setSocket:React.Dispatch<React.SetStateAction<Socket| null>>
};

const userContextState = {
  onlineUsers: null,
  setOnlineUsers: () => "",
  // socketRef: { current: null },
  // setSocket:() => ""
};
const userContext = createContext<UserContextType>(userContextState);

export const useUser = () => useContext(userContext);

export const User = ({ children }: { children: React.ReactNode }) => {
  const [onlineUsers, setOnlineUsers] = useState<User[] | null>(null);

  // let socketRef = useRef<Socket | null>(null);
  // useEffect(() => {
  //   const user = JSON.parse(localStorage.getItem("Current_User") as string);

  //   if (user) {
  //     socketRef.current = io(import.meta.env.VITE_API, {
  //       query: { userId: user?._id, username: user?.username },
  //     });
  //   }
    
  // },[]);

  const value = {
    onlineUsers,
    setOnlineUsers,
    // socketRef,
  };
  return <userContext.Provider value={value}>{children}</userContext.Provider>;
};
