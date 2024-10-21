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
    profilePictureHandler,
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
      profilePictureHandler(data.avatarFile[0]);
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
    profilePictureHandler(undefined);
    setEmail(EMPTY_STRING);
    setUser(EMPTY_STRING);
    setPassword(EMPTY_STRING);
    isAvatarFilled = false;
    setIsAddImg(false);
  }, []);

  console.log(isAvatarFilled);
  return (
    <div className="flex flex-col">
      <Link
        to="/"
        className={
          user && password && email ? "hidden" : "lg:w-[1280px] flex justify-start mx-auto my-4"
        }
      >
        <h3>{`< Go Back `}</h3>
      </Link>
      <div
        className={
          user && password && email ? "relative cursor-pointer flex flex-col mt-16" : EMPTY_STRING
        }
      >
        <div
          className={
            user && password && email
              ? "register-popup-inner p-12 bg-gray-500 sm:w-[50%] w-[90%] h-[40%] my-auto mx-auto inset-0 text-white"
              : EMPTY_STRING
          }
        >
          {user && password && email ? (
            <p>Your Details has been Succesfully Submitted. You are register. Thanks!</p>
          ) : null}
          {user && password && email ? (
            <button
              type="button"
              className="m-auto w-24 my-3 bg-gray-500 text-white border border-solid border-white p-2 hover:bg-gray-400"
              onClick={registerUser}
              disabled={!((isAddImg && isAvatarFilled) || !isAvatarFilled)}
            >
              {(isAddImg && isAvatarFilled) || !isAvatarFilled ? "Go Home" : "Loading..."}
            </button>
          ) : null}
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSub)}
        className={user && password && email ? "hidden" : "flex flex-col m-auto"}
      >
        <input
          id="username-register"
          type="text"
          {...register("usernameIn")}
          className={
            errors.usernameIn ? "error pl-1 w-60 border-b mt-5" : "pl-1 w-60 border-b mt-5"
          }
          placeholder={errors.usernameIn ? "username is empty" : userInPlaceholder}
        />
        <p className={errors.usernameIn ? "text-red-300 text-start mb-5 mt-1" : "mb-5 mt-1"}>
          {errors.usernameIn?.message}
        </p>
        <input
          id="password-register"
          type="text"
          {...register("passwordIn")}
          className={
            errors.passwordIn ? "error pl-1 w-60 border-b mt-5" : "pl-1 w-60 border-b mt-5"
          }
          placeholder={errors.passwordIn ? "password is empty" : pwInPlaceholder}
        />
        <p className={errors.passwordIn ? "text-red-300 text-start mb-5 mt-1" : "mb-5 mt-1"}>
          {errors.passwordIn?.message}
        </p>
        <input
          id="email-register"
          type="email"
          {...register("emailIn")}
          className={errors.emailIn ? "error pl-1 w-60 border-b mt-5" : "pl-1 w-60 border-b mt-5"}
          placeholder={errors.emailIn ? "email is empty" : emailInPlaceholder}
        />
        <p className={errors.emailIn ? "text-red-300 text-start mb-5 mt-1" : "mb-5 mt-1"}>
          {errors.emailIn?.message}
        </p>
        <div id="add-img">
          <p className="text-start mt-6"> Add your picture profile</p>
          <input
            {...register("avatarFile")}
            type="file"
            className="w-60 sm:w-96 my-3 p-2 file:hover:bg-gray-400 file:bg-gray-500 file:text-white file:border-none file:px-4 file:py-2"
          />
          <h2 className="text-start">Uploading {progress}%</h2>
        </div>
        <p className={errors.avatarFile ? "text-red-300 text-start mb-5 mt-1" : "mb-5 mt-1"}>
          {errors.avatarFile?.message}
        </p>
        <button
          type="submit"
          className="w-20 my-8 bg-gray-500 text-white border border-solid border-white p-2 hover:bg-gray-400"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Loading" : "Register"}
        </button>
      </form>
    </div>
  );
};
