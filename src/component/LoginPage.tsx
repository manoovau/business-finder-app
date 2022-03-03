import React, { ChangeEvent } from "react";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../context/UserContext";

const EMPTY_STRING = "";

export const LoginPage = (): JSX.Element => {
  const {
    isUserInError,
    user,
    userInPlaceholder,
    isPwInError,
    password,
    pwInPlaceholder,
    setUser,
    setPassword,
    loginUser,
  } = useContext(UserContext);

  return (
    <div>
      <Link to="/">
        <h3>{`< Go Back `}</h3>
      </Link>
      <input
        id="username-login"
        type="text"
        className={isUserInError ? "error" : EMPTY_STRING}
        value={user}
        placeholder={userInPlaceholder}
        onChange={(e: ChangeEvent<HTMLInputElement>): void => setUser(e.target.value)}
        required
      />
      <input
        id="password-login"
        type="text"
        className={isPwInError ? "error" : EMPTY_STRING}
        value={password}
        placeholder={pwInPlaceholder}
        onChange={(e: ChangeEvent<HTMLInputElement>): void => setPassword(e.target.value)}
        required
      />
      <button onClick={loginUser}>Login</button>
    </div>
  );
};
