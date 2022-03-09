import React, { ChangeEvent } from "react";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { SubmitHandler, useForm } from "react-hook-form";

const EMPTY_STRING = "";

export const RegisterPage = (): JSX.Element => {
  const {
    isUserInError,
    user,
    userInPlaceholder,
    isPwInError,
    password,
    pwInPlaceholder,
    isEmailInError,
    email,
    emailInPlaceholder,
    isAddImg,
    progress,
    setUser,
    setPassword,
    setEmail,
    setIsAddImg,
    formHandler,
    registerUser,
  } = useContext(UserContext);

  type Inputs = {
    avatarName: File[];
  };

  const { register, handleSubmit } = useForm<Inputs>();

  const onSub: SubmitHandler<Inputs> = (data) => {
    formHandler(data.avatarName[0]);
  };

  return (
    <div>
      <Link to="/">
        <h3>{`< Go Back `}</h3>
      </Link>
      <input
        id="username-register"
        type="text"
        className={isUserInError ? "error" : EMPTY_STRING}
        value={user}
        placeholder={userInPlaceholder}
        onChange={(e: ChangeEvent<HTMLInputElement>): void => setUser(e.target.value)}
      />
      <input
        id="password-register"
        type="text"
        className={isPwInError ? "error" : EMPTY_STRING}
        value={password}
        placeholder={pwInPlaceholder}
        onChange={(e: ChangeEvent<HTMLInputElement>): void => setPassword(e.target.value)}
      />
      <input
        id="email-register"
        type="text"
        className={isEmailInError ? "error" : EMPTY_STRING}
        value={email}
        placeholder={emailInPlaceholder}
        onChange={(e: ChangeEvent<HTMLInputElement>): void => setEmail(e.target.value)}
      />
      <div id="add-img" onClick={() => setIsAddImg(!isAddImg)}>
        <form onSubmit={handleSubmit(onSub)}>
          <input {...register("avatarName")} type="file" className="input" />
          <button>Upload</button>
        </form>
        <hr />
        <h2>Uploading {progress}%</h2>
      </div>
      <button onClick={registerUser}>Register</button>
    </div>
  );
};
