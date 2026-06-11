import { createContext, useContext, useState } from "react";

type User = {
  [index:string] : string
};

type UserContextType = {
  users: User[] | null;
  setUsers: React.Dispatch<React.SetStateAction<User[] | null>>;
};

const userContextState = {
  users: null,
  setUsers: () => "",
};
const userContext = createContext<UserContextType>(userContextState);

export const useUser = () => useContext(userContext);

export const User = ({ children }: { children: React.ReactNode }) => {
  const [users, setUsers] = useState<User[] | null>(null);

  return (
    <userContext.Provider value={{ users, setUsers }}>
      {children}
    </userContext.Provider>
  );
};
