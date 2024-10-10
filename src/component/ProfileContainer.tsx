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
    <div id="profile-contaimer">
      <div id="change-pw-container">
        <Link to="/">
          <h3>{`< Go Back `}</h3>
        </Link>
        <input
          id="current-password"
          type="text"
          className={isCurrentPwError ? "error" : EMPTY_STRING}
          value={currentPw}
          placeholder={currentPwPlaceholder}
          onChange={(e: ChangeEvent<HTMLInputElement>): void => setCurrentPw(e.target.value)}
          required
        />
        <input
          id="new-password"
          type="text"
          className={isNewPw1Error ? "error" : EMPTY_STRING}
          value={newPw1}
          placeholder={newPw1Placeholder}
          onChange={(e: ChangeEvent<HTMLInputElement>): void => setNewPw1(e.target.value)}
          required
        />
        <input
          id="new-password"
          type="text"
          className={isNewPw1Error ? "error" : EMPTY_STRING}
          value={newPw2}
          placeholder={newPw2Placeholder}
          onChange={(e: ChangeEvent<HTMLInputElement>): void => setNewPw2(e.target.value)}
          required
        />
        <Link to="/">
          <button onClick={updatePw}>Change Password</button>
        </Link>
      </div>
      <div id="remove-account-container">
        <button className={isDelConf ? "hidden" : "block"} onClick={() => setIsDelConf(!isDelConf)}>
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
  );
};
