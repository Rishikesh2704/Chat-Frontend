import { createContext, useContext, useState } from "react";

type User = {
  [index: string]: string;
};

// type LoggedInUserType = {
//   id: string;
//   username: string;
//   profile?: string;
// };

type UserContextType = {
  onlineUsers: User[] | null;
  setOnlineUsers: React.Dispatch<React.SetStateAction<User[] | null>>;
  // loggedInUser: LoggedInUserType | null;
  // setLoggedInUser: React.Dispatch<React.SetStateAction<LoggedInUserType | null>>
};

const userContextState = {
  onlineUsers: null,
  setOnlineUsers: () => "",
  // loggedInUser:null,
  // setLoggedInUser: () => "",
};
const userContext = createContext<UserContextType>(userContextState);

export const useUser = () => useContext(userContext);

export const User = ({ children }: { children: React.ReactNode }) => {
  const [onlineUsers, setOnlineUsers] = useState<User[] | null>(null);
  // const [loggedInUser, setLoggedInUser] = useState<LoggedInUserType[] | null>(null);
  return (
    <userContext.Provider value={{ onlineUsers, setOnlineUsers }}>
      {children}
    </userContext.Provider>
  );
};
