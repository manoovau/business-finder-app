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
      <Link to="/" className="m-5 text-start">
        <h3>{`< Go Back `}</h3>
      </Link>
      <div className="flex flex-col justify-center sm:flex-row">
        <input
          id="username-login"
          type="text"
          className={
            isUserInError ? "error pl-1 w-60 border-b ml-20 my-5" : "pl-1 w-60 border-b ml-20 my-5"
          }
          value={user}
          placeholder={userInPlaceholder}
          onChange={(e: ChangeEvent<HTMLInputElement>): void => setUser(e.target.value)}
          required
        />
        <input
          id="password-login"
          type="text"
          className={
            isPwInError ? "error pl-1 w-60 border-b ml-20 my-5" : "pl-1 w-60 border-b ml-20 my-5"
          }
          value={password}
          placeholder={pwInPlaceholder}
          onChange={(e: ChangeEvent<HTMLInputElement>): void => setPassword(e.target.value)}
          required
        />
        <button
          className="w-16 ml-20 my-3 bg-gray-500 text-white border border-solid border-white p-2 hover:bg-gray-400"
          onClick={loginUser}
        >
          Login
        </button>
      </div>
      <div className="sm:my-24 sm:mx-3 mx-0 my-16 flex flex-col sm:flex-row justify-center">
        <p className="sm:ml-20 sm:my-5 ml-12">{`Don't have an account? Create a new account.`}</p>
        <Link to="/register">
          <p className="sm:ml-12 sm:my-3 ml-20 my-4 w-20 bg-gray-500 text-white border border-solid border-white p-2 hover:bg-gray-400">{`Sign Up`}</p>
        </Link>
      </div>
    </div>
  );
};
