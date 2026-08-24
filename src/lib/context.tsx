import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { io, type Socket } from "socket.io-client";


type UserContextType = {
  onlineUsers: User[] | null;
  setOnlineUsers: React.Dispatch<React.SetStateAction<User[] | null>>;
  currentUser:User | null;
  // socketRef: React.RefObject<Socket | null>;
  // setSocket:React.Dispatch<React.SetStateAction<Socket| null>>
};

const userContextState = {
  onlineUsers: null,
  setOnlineUsers: () => "",
  currentUser:null
  // socketRef: { current: null },
  // setSocket:() => ""
};
const userContext = createContext<UserContextType>(userContextState);

export const useUser = () => useContext(userContext);

export const User = ({ children }: { children: React.ReactNode }) => {
  const [onlineUsers, setOnlineUsers] = useState<User[] | null>(null);
  const [currentUser, setCurrentUser] = useState(null)
  useEffect(() => {
    try { 
      const string = localStorage.getItem("Current_User")
      if(string){
        const user =JSON.parse(string as string);
        setCurrentUser(user);
      }
    } catch (error) {
      console.log(error);
    }
  }, [])
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
    currentUser,
    // socketRef,
  };
  return <userContext.Provider value={value}>{children}</userContext.Provider>;
};
