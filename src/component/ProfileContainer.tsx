import React, { ChangeEvent, useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../context/UserContext";

const EMPTY_STRING = "";

export const ProfileContainer = (): JSX.Element => {
  const {
    isCurrentPwError,
    currentPw,
    currentPwPlaceholder,
    isNewPw1Error,
    newPw1,
    newPw1Placeholder,
    newPw2,
    newPw2Placeholder,
    isDelConf,
    setCurrentPw,
    setNewPw1,
    setNewPw2,
    updatePw,
    setIsDelConf,
    deleteUser,
  } = useContext(UserContext);

  return (
    <div id="profile-contaimer" className="flex flex-col m-auto">
      <div id="change-pw-container" className="flex flex-col">
        <Link to="/" className="lg:w-[1280px] flex justify-start mx-auto my-4">
          <h3>{`< Go Back `}</h3>
        </Link>
        <div className="flex flex-col m-auto mt-16">
          <input
            id="current-password"
            type="text"
            className={
              isCurrentPwError ? "error pl-1 w-60 border-b my-5" : "pl-1 w-60 border-b my-5"
            }
            value={currentPw}
            placeholder={currentPwPlaceholder}
            onChange={(e: ChangeEvent<HTMLInputElement>): void => setCurrentPw(e.target.value)}
            required
          />
          <input
            id="new-password"
            type="text"
            className={isNewPw1Error ? "error pl-1 w-60 border-b my-5" : "pl-1 w-60 border-b my-5"}
            value={newPw1}
            placeholder={newPw1Placeholder}
            onChange={(e: ChangeEvent<HTMLInputElement>): void => setNewPw1(e.target.value)}
            required
          />
          <input
            id="new-password"
            type="text"
            className={isNewPw1Error ? "error pl-1 w-60 border-b my-5" : "pl-1 w-60 border-b my-5"}
            value={newPw2}
            placeholder={newPw2Placeholder}
            onChange={(e: ChangeEvent<HTMLInputElement>): void => setNewPw2(e.target.value)}
            required
          />
        </div>

        <div className="flex sm:flex-row flex-col m-auto my-16">
          <Link to="/">
            <button
              className="mr-12 w-32 my-3 bg-gray-500 text-white border border-solid border-white p-2 hover:bg-gray-400"
              onClick={updatePw}
            >
              Change Password
            </button>
          </Link>
          <div id="remove-account-container">
            <button
              className={
                isDelConf
                  ? "hidden"
                  : "block w-32 my-3 bg-red-400 text-white border border-solid border-white p-2 hover:bg-red-300"
              }
              onClick={() => setIsDelConf(!isDelConf)}
            >
              REMOVE ACCOUNT
            </button>
            <div id="delete-confirm-container" className={isDelConf ? "block" : "hidden"}>
              <p>Are you sure ?</p>
              <Link to="/">
                <button onClick={deleteUser}>yes</button>
              </Link>
              <Link to="/">
                <button>no</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
