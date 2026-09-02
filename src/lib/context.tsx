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
  onlineUsers: User[] | null;
  setOnlineUsers: React.Dispatch<React.SetStateAction<User[] | null>>;
  loginUser: (user: User) => void;
  logoutUser: () => void;
  getUser: () => any;
  currentUser: User | null;
  socket: any;
};

const userContextState = {
  onlineUsers: null,
  setOnlineUsers: () => "",
  loginUser: (user: User) => null,
  logoutUser: () => null,
  getUser: () => {},
  currentUser: null,
  socket: null,
};
const userContext = createContext<UserContextType>(userContextState);

export const useUser = () => useContext(userContext);

export const User = ({ children }: { children: React.ReactNode }) => {
  const [onlineUsers, setOnlineUsers] = useState<User[] | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
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

  const loginUser = (user: User) => {
    if (!user) return;
    localStorage.setItem("Current_User", JSON.stringify(user));
    setCurrentUser(user);
    return;
  };

  const getUser = () => {
    if (currentUser) return currentUser;
    try {
      const string = localStorage.getItem("Current_User") as string;
      const user = JSON.parse(string);
      return user;
    } catch (error) {
      console.log("Failed in getting current User:", error);
    }
  };

  const logoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem("Current_User");
    return;
  };

  const value = {
    onlineUsers,
    setOnlineUsers,
    loginUser,
    logoutUser,
    getUser,
    currentUser,
    socket,
  };
  return <userContext.Provider value={value}>{children}</userContext.Provider>;
};
