import { createContext, useContext, useState } from "react";

type User = {
  id: number;
  username: string;
  profile: string;
};

type UserContextType = {
    user:User | undefined;
    setUser: React.Dispatch<React.SetStateAction<User | undefined>>;
    loggedUser: (user:User) => void;
}

const userContextState = {
    user:undefined,
    setUser:() => '' ,
    loggedUser:() => '',
}
const userContext = createContext<UserContextType>(userContextState);

export const useUser = () => useContext(userContext);

export const User = ({ children }: { children: any }) => {
  const [user, setUser] = useState<User | undefined>();
  const loggedUser = (user:User) => {
    setUser(user);
  };

  return (
    <userContext.Provider value={{ loggedUser, user, setUser }}>
      {children}
    </userContext.Provider>
  );
};
