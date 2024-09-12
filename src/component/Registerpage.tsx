import React, { useEffect } from "react";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const EMPTY_STRING = "";
let isAvatarFilled = false;
const MAX_FILE_SIZE = 5000000;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const schema = z.object({
  usernameIn: z.string().min(4),
  passwordIn: z.string().min(8),
  emailIn: z.string().email(),
  avatarFile: z
    .any()
    .optional()
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE || files?.length === 0,
      "Max image size is 5MB.",
    )
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type) || files?.length === 0,
      "Only .jpg, .jpeg, .png and .webp formats are supported.",
    ),
});

type Inputs = z.infer<typeof schema>;

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
    formHandler,
    registerUser,
    setProgress,
    setIsAddImg,
  } = useContext(UserContext);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>({
    defaultValues: {
      usernameIn: EMPTY_STRING,
      passwordIn: EMPTY_STRING,
      emailIn: EMPTY_STRING,
      avatarFile: undefined,
    },
    resolver: zodResolver(schema),
  });

  const onSub: SubmitHandler<Inputs> = (data) => {
    if (data.avatarFile.length !== 0) isAvatarFilled = true;

    try {
      formHandler(data.avatarFile[0]);
      setEmail(data.emailIn);
      setUser(data.usernameIn);
      setPassword(data.passwordIn);
    } catch (error) {
      console.log("onSub error");
      console.log(error);
      console.log(data);
    }
  };

  useEffect(() => {
    setProgress(0);
    formHandler(undefined);
    setEmail(EMPTY_STRING);
    setUser(EMPTY_STRING);
    setPassword(EMPTY_STRING);
    isAvatarFilled = false;
    setIsAddImg(false);
  }, []);

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
            <button
              type="button"
              onClick={registerUser}
              disabled={!((isAddImg && isAvatarFilled) || !isAvatarFilled)}
            >
              {(isAddImg && isAvatarFilled) || !isAvatarFilled ? "Go Home" : "Loading..."}
            </button>
          ) : null}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSub)}>
        <input
          id="username-register"
          type="text"
          {...register("usernameIn")}
          className={errors.usernameIn ? "error" : EMPTY_STRING}
          placeholder={errors.usernameIn ? "username is empty" : userInPlaceholder}
        />
        <p className={errors.usernameIn ? "error" : EMPTY_STRING}>{errors.usernameIn?.message}</p>
        <input
          id="password-register"
          type="text"
          {...register("passwordIn")}
          className={errors.passwordIn ? "error" : EMPTY_STRING}
          placeholder={errors.passwordIn ? "password is empty" : pwInPlaceholder}
        />
        <p className={errors.passwordIn ? "error" : EMPTY_STRING}>{errors.passwordIn?.message}</p>
        <input
          id="email-register"
          type="email"
          {...register("emailIn")}
          className={errors.emailIn ? "error" : EMPTY_STRING}
          placeholder={errors.emailIn ? "email is empty" : emailInPlaceholder}
        />
        <p className={errors.emailIn ? "error" : EMPTY_STRING}>{errors.emailIn?.message}</p>
        <div id="add-img">
          <input {...register("avatarFile")} type="file" className="input" />
          <hr />
          <h2>Uploading {progress}%</h2>
        </div>
        <p className={errors.avatarFile ? "error" : EMPTY_STRING}>{errors.avatarFile?.message}</p>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Loading" : "Register"}
        </button>
      </form>
    </div>
  );
};
