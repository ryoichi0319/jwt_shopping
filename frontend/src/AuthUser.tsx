import React from "react";
import { createContext,useContext ,useState} from "react";

export type AuthUserContextType = {
  user: any
  signin: (user:any, callback:() => void) => void;
  signout: (callback:() => void) => void;
}
const AuthUserContext = createContext<AuthUserContextType>({} as AuthUserContextType);

export const useAuthUserContext = ():AuthUserContextType => {
  return useContext<AuthUserContextType>(AuthUserContext);
}

type Props = {
  children: React.ReactNode
}

export const AuthUserProvider = (props:Props) => {
  const [user, setUser] = useState<any | null>(null);

  const signin = (newUser: any, callback: () => void) => {
    setUser(newUser);
    callback();
  }

  const signout = (callback: () => void) => {
    setUser(null);
    callback();
  }


  const value:AuthUserContextType = { user, signin, signout };
  return (
    <AuthUserContext.Provider value={value}>
      {props.children}
    </AuthUserContext.Provider>
  );
}