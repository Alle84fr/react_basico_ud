import { createContext, useContext } from "react";

export const AuthContext = createContext({
  usuario: null,
  setUsuario: () => {},
});

export const useAuth = () => useContext(AuthContext);
