import React from "react";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { SubmitHandler, useForm } from "react-hook-form";

const EMPTY_STRING = "";

export const RegisterPage = (): JSX.Element => {
  const {
    user,
    userInPlaceholder,
    password,
    pwInPlaceholder,
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
    usernameIn: string;
    passwordIn: string;
    emailIn: string;
    avatarName: File[];
  };

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>({
    defaultValues: { usernameIn: user, passwordIn: password, emailIn: email },
  });

  const onSub: SubmitHandler<Inputs> = (data) => {
    try {
      formHandler(data.avatarName[0]);

      setEmail(data.emailIn);

      setUser(data.usernameIn);
      setPassword(data.passwordIn);
      console.log(data);
    } catch (error) {
      setError("emailIn", {
        message: "This email is already taken",
      });
    }
  };

  return (
    <div>
      <Link to="/">
        <h3>{`< Go Back `}</h3>
      </Link>
      <div className={user && password && email ? "register-popup" : EMPTY_STRING}>
        <div className={user && password && email ? "register-popup-inner" : EMPTY_STRING}>
          {user && password && email ? (
            <p>Your Details has been Succesfully Submitted. You are register. Thanks!</p>
          ) : null}
          {user && password && email ? (
            <button type="button" onClick={registerUser}>
              Go Home
            </button>
          ) : null}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSub)}>
        <input
          id="username-register"
          type="text"
          {...register("usernameIn", {
            required: {
              value: true,
              message: "username is required",
            },
          })}
          className={errors.usernameIn ? "error" : EMPTY_STRING}
          placeholder={errors.usernameIn ? "username is empty" : userInPlaceholder}
        />
        <p className={errors.usernameIn ? "error" : EMPTY_STRING}>{errors.usernameIn?.message}</p>
        <input
          id="password-register"
          type="text"
          {...register("passwordIn", {
            required: "Password is required",
            minLength: { value: 8, message: "Password must have at least 8 characters" },
          })}
          className={errors.passwordIn ? "error" : EMPTY_STRING}
          placeholder={errors.passwordIn ? "password is empty" : pwInPlaceholder}
        />
        <p className={errors.passwordIn ? "error" : EMPTY_STRING}>{errors.passwordIn?.message}</p>
        <input
          id="email-register"
          type="email"
          {...register("emailIn", {
            required: "Email is required",
            pattern: {
              value:
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
              message: "Please enter a valid email",
            },
          })}
          className={errors.emailIn ? "error" : EMPTY_STRING}
          placeholder={errors.emailIn ? "email is empty" : emailInPlaceholder}
        />
        <p className={errors.emailIn ? "error" : EMPTY_STRING}>{errors.emailIn?.message}</p>
        <div id="add-img" onClick={() => setIsAddImg(!isAddImg)}>
          <input {...register("avatarName")} type="file" className="input" />
          <hr />
          <h2>Uploading {progress}%</h2>
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Loading" : "Register"}
        </button>
      </form>
    </div>
  );
};
