import React, { ChangeEvent } from "react";
import { useContext } from "react";
import { Link, Route, Switch } from "react-router-dom";
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
    <div className="flex flex-col">
      <Link to="/" className="lg:w-[1280px] flex justify-start mx-auto my-4">
        <h3>{`< Go Back `}</h3>
      </Link>
      <div className="flex flex-col justify-center mx-auto">
        <input
          id="username-login"
          type="text"
          className={isUserInError ? "error pl-1 w-60 border-b my-5" : "pl-1 w-60 border-b my-5"}
          value={user}
          placeholder={userInPlaceholder}
          onChange={(e: ChangeEvent<HTMLInputElement>): void => setUser(e.target.value)}
          required
        />
        <input
          id="password-login"
          type="text"
          className={isPwInError ? "error pl-1 w-60 border-b my-5" : "pl-1 w-60 border-b my-5"}
          value={password}
          placeholder={pwInPlaceholder}
          onChange={(e: ChangeEvent<HTMLInputElement>): void => setPassword(e.target.value)}
          required
        />
        <button
          className="w-16 my-3 bg-gray-500 text-white border border-solid border-white p-2 hover:bg-gray-400"
          onClick={loginUser}
        >
          Login
        </button>
      </div>
      <div className="sm:my-24 sm:mx-3 mx-0 my-16 flex flex-col justify-center">
        <p className="sm:my-5">{`Don't have an account? Create a new account.`}</p>
        <Link to="/register" className="mx-auto">
          <p className="sm:my-3  my-4 w-20 bg-gray-500 text-white border border-solid border-white p-2 hover:bg-gray-400">{`Sign Up`}</p>
        </Link>
      </div>
    </div>
  );
};
