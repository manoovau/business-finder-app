import React, { useState, useEffect, createContext } from "react";

import {
  CollectionReference,
  DocumentData,
  QueryDocumentSnapshot,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  QuerySnapshot,
} from "firebase/firestore";

import { db, storage } from "../firebase-config";

import {
  getDownloadURL,
  ref,
  StorageError,
  uploadBytesResumable,
  UploadTaskSnapshot,
} from "firebase/storage";

type UserContextType = {
  isCurrentPwError: boolean;
  currentPw: string;
  currentPwPlaceholder: string;
  isNewPw1Error: boolean;
  newPw1: string;
  newPw1Placeholder: string;
  newPw2: string;
  newPw2Placeholder: string;
  isDelConf: boolean;
  isUserInError: boolean;
  user: string;
  userInPlaceholder: string;
  isPwInError: boolean;
  password: string;
  pwInPlaceholder: string;
  isEmailInError: boolean;
  email: string;
  emailInPlaceholder: string;
  isAddImg: boolean;
  progress: number;
  currentUsersId: userLocalType;
  userLocalInit: userLocalType;
  setCurrentPw: (pw: string) => void;
  setNewPw1: (newPw: string) => void;
  setNewPw2: (newPw: string) => void;
  updatePw: () => void;
  setIsDelConf: (isDel: boolean) => void;
  deleteUser: () => void;
  setUser: (user: string) => void;
  setPassword: (password: string) => void;
  setEmail: (email: string) => void;
  setIsAddImg: (isAddImg: boolean) => void;
  formHandler: (file: File | undefined) => void;
  registerUser: () => void;
  loginUser: () => void;
  logOut: () => void;
};

type userLocalType = {
  id: string;
  username: string;
  password: string;
  email: string;
  avatar: string;
};

const EMPTY_STRING = "";

const userLocalInit = {
  id: EMPTY_STRING,
  username: EMPTY_STRING,
  password: EMPTY_STRING,
  email: EMPTY_STRING,
  avatar: EMPTY_STRING,
};

const defaultContext = {
  isCurrentPwError: false,
  currentPw: EMPTY_STRING,
  currentPwPlaceholder: "Fill current password",
  isNewPw1Error: false,
  newPw1: EMPTY_STRING,
  newPw1Placeholder: "Fill new password",
  newPw2: EMPTY_STRING,
  newPw2Placeholder: "Repeat new password",
  isDelConf: false,
  isUserInError: false,
  user: EMPTY_STRING,
  userInPlaceholder: "username",
  isPwInError: false,
  password: EMPTY_STRING,
  pwInPlaceholder: "password",
  isEmailInError: false,
  email: EMPTY_STRING,
  emailInPlaceholder: "email",
  isAddImg: false,
  progress: 0,
  currentUsersId: userLocalInit,
  userLocalInit: userLocalInit,
  setCurrentPw: () => undefined,
  setNewPw1: () => undefined,
  setNewPw2: () => undefined,
  updatePw: () => undefined,
  setIsDelConf: () => undefined,
  deleteUser: () => undefined,
  setUser: () => undefined,
  setPassword: () => undefined,
  setEmail: () => undefined,
  setIsAddImg: () => undefined,
  formHandler: () => undefined,
  registerUser: () => undefined,
  loginUser: () => undefined,
  logOut: () => undefined,
};

/**
 * get data from firebase
 * @param usersCollecRef firebase collection
 * @returns users firebase response
 */
const getUsers = async (
  usersCollecRef: CollectionReference<DocumentData>,
): Promise<QuerySnapshot<DocumentData>> => {
  const data = await getDocs(usersCollecRef);

  return data;
};

/**
 * get users list from firebase
 * @returns users firebase array response
 */
export const getUsersAsyncFunc = async (
  collectRef: CollectionReference<DocumentData>,
): Promise<undefined | QuerySnapshot<DocumentData>> => {
  try {
    return await getUsers(collectRef);
  } catch (err: unknown) {
    console.error(err);
  }
};

const UserContext = createContext<UserContextType>(defaultContext);

const UserContextProvider = ({ children }: { children?: React.ReactNode }) => {
  const [user, setUser] = useState<string>(EMPTY_STRING);
  const [userInPlaceholder, setUserInPlaceholder] = useState<string>("username");
  const [isUserInError, setIsUserInError] = useState<boolean>(false);
  const [password, setPassword] = useState<string>(EMPTY_STRING);
  const [pwInPlaceholder, setPwInPlaceholder] = useState<string>("password");
  const [isPwInError, setIsPwInError] = useState<boolean>(false);
  const [email, setEmail] = useState<string>(EMPTY_STRING);
  const [emailInPlaceholder, setEmailInPlaceholder] = useState<string>("email");
  const [isEmailInError, setIsEmailInError] = useState<boolean>(false);
  const [avatarUrl, setAvatarUrl] = useState<string>(EMPTY_STRING);
  const [registerCount, setRegisterCount] = useState<number>(0);
  const [currentPw, setCurrentPw] = useState<string>(EMPTY_STRING);
  const [currentPwPlaceholder, setCurrentPwPlaceholder] = useState<string>("Fill current password");
  const [isCurrentPwError, setIsCurrentPwError] = useState<boolean>(false);
  const [newPw1, setNewPw1] = useState<string>(EMPTY_STRING);
  const [newPw1Placeholder, setNewPw1Placeholder] = useState<string>("Fill new password");
  const [isNewPw1Error, setIsNewPw1Error] = useState<boolean>(false);
  const [newPw2, setNewPw2] = useState<string>(EMPTY_STRING);
  const [newPw2Placeholder, setNewPw2Placeholder] = useState<string>("Repeat new password");
  const [isDelConf, setIsDelConf] = useState<boolean>(false);

  const [users, setUsers] = useState<[] | QueryDocumentSnapshot<DocumentData>[]>([]);
  const [currentUsersId, setCurrentUsersId] = useState<userLocalType>(userLocalInit);
  const usersCollecRef = collection(db, "users");
  const usersLocal: userLocalType[] = [];

  const [isAddImg, setIsAddImg] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  /**
   * create user inside users firebase collection
   */
  const createUser = async (
    user: string,
    password: string,
    email: string,
    avatar: string,
  ): Promise<void> => {
    await addDoc(usersCollecRef, {
      email: email,
      password: password,
      username: user,
      avatar: avatar,
    });
  };

  /**
   * update password field inside users firebase collection
   */
  const updateUser = async (pw: string): Promise<void> => {
    const userDoc = doc(db, "users", currentUsersId.id);
    await updateDoc(userDoc, { password: pw });
  };

  /**
   * delete user inside firebase collection
   */
  const deleteUser = async (): Promise<void> => {
    const userDoc = doc(db, "users", currentUsersId.id);
    await deleteDoc(userDoc);
    logOut();
  };

  /**
   * identify errors inside login input values and allow to access user account
   */
  const loginUser = (): void => {
    setIsUserInError(false);
    setIsPwInError(false);

    if (!password) {
      setPwInPlaceholder("password is empty");
      setIsPwInError(true);
    }
    if (!user) {
      setUserInPlaceholder("username is empty");
      setIsUserInError(true);
    } else {
      const usernameFilter = usersLocal.filter((item: userLocalType) => item.username === user);
      if (usernameFilter.length === 0) {
        setUserInPlaceholder("username is not correct");
        setIsUserInError(true);
        setUser(EMPTY_STRING);
      } else if (usernameFilter.length > 0 && usernameFilter[0].password === password) {
        setCurrentUsersId(usernameFilter[0]);
        setIsUserInError(false);
      } else if (usernameFilter.length > 0 && usernameFilter[0].password !== password) {
        setIsPwInError(true);
        setPwInPlaceholder("password is not correct");
        setPassword(EMPTY_STRING);
        setCurrentUsersId(userLocalInit);
      }
    }
  };

  /**
   * identify errors inside register input values and store correct user registration information
   */
  const registerUser = (): void => {
    setIsUserInError(false);
    setIsPwInError(false);
    setIsEmailInError(false);

    if (!user) setIsUserInError(true);

    if (!password) setIsPwInError(true);

    if (!email) {
      setIsEmailInError(true);
    } else {
      const checkEmailInput = usersLocal.filter((item: userLocalType) => item.email === email);
      // Email used by other user
      if (checkEmailInput.length > 0) {
        setEmailInPlaceholder("E-mail address already in use");

        setIsEmailInError(true);
        setEmail(EMPTY_STRING);
      } else {
        const checkUsernameInput = usersLocal.filter(
          (item: userLocalType) => item.username === user,
        );
        if (checkUsernameInput.length > 0) {
          setUser(EMPTY_STRING);
          setUserInPlaceholder("Please, use other username");
          setIsUserInError(true);
        }
      }

      if (user && password && email)
        setCurrentUsersId({
          ...currentUsersId,
          username: user,
          password: password,
          email: email,
          avatar: avatarUrl,
        });
    }
  };

  /**
   * identify errors inside change password inputs and replace old password with new password
   */
  const updatePw = (): void => {
    if (currentPw !== currentUsersId.password) {
      setIsCurrentPwError(true);
      setCurrentPwPlaceholder("Password is not correct");
    } else {
      setIsCurrentPwError(false);
      setCurrentPwPlaceholder("Fill current password");
      if (newPw1 !== newPw2) {
        setIsNewPw1Error(true);
        setNewPw1Placeholder("New Password is not equal");
        setNewPw2Placeholder(EMPTY_STRING);
      } else {
        setIsNewPw1Error(false);
        setCurrentPw(EMPTY_STRING);

        setCurrentUsersId({ ...currentUsersId, password: newPw1 });
        setNewPw1Placeholder("Fill new password");
        setNewPw2Placeholder("Repeat new password");

        updateUser(newPw1);
      }
    }
  };

  /**
   * store local file in firebase database
   * @param file local file
   */
  const uploadFile = (file: File | undefined): void => {
    if (!file) return;

    const storageRef = ref(storage, `/files/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot: UploadTaskSnapshot) => {
        setProgress(Math.round(snapshot.bytesTransferred / snapshot.totalBytes) * 100);
      },
      (err: StorageError) => console.error(err),
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((url: string) => setAvatarUrl(url));
      },
    );
  };

  /**
   * extract file input and run firebase upload function
   * @param e file input value
   */
  const formHandler = (file: File | undefined): void => {
    if (file !== null && file !== undefined) uploadFile(file);
  };

  useEffect(() => {
    if (user && password && email) {
      createUser(
        currentUsersId.username,
        currentUsersId.password,
        currentUsersId.email,
        currentUsersId.avatar,
      );

      setRegisterCount((prev) => prev + 1);
    }
  }, [currentUsersId]);

  useEffect(() => {
    if (currentUsersId.id === EMPTY_STRING && currentUsersId.username !== EMPTY_STRING) {
      const usernameFilter: userLocalType[] = usersLocal.filter(
        (item: userLocalType) => item.username === user,
      );

      if (usernameFilter[0] !== undefined)
        setCurrentUsersId({ ...currentUsersId, id: usernameFilter[0].id });
    }
  }, [usersLocal]);

  useEffect(() => {
    const getUsersData = async (): Promise<void> => {
      const resp = await getUsersAsyncFunc(usersCollecRef);
      if (resp !== undefined) setUsers(resp.docs);
    };
    getUsersData();
  }, [user, registerCount]);

  if (users.length > 0)
    users.map((doc: DocumentData) => usersLocal.push({ ...doc.data(), id: doc.id }));

  /**
   * set initial values for user, password, email amd currentUsersId
   */
  const logOut = (): void => {
    setUser(EMPTY_STRING);
    setPassword(EMPTY_STRING);
    setEmail(EMPTY_STRING);
    setCurrentUsersId(userLocalInit);
  };

  return (
    <UserContext.Provider
      value={{
        isCurrentPwError,
        currentPw,
        currentPwPlaceholder,
        isNewPw1Error: isNewPw1Error,
        newPw1,
        newPw1Placeholder,
        newPw2,
        newPw2Placeholder,
        isDelConf,
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
        currentUsersId,
        userLocalInit,
        setCurrentPw,
        setNewPw1,
        setNewPw2,
        updatePw,
        setIsDelConf,
        deleteUser,
        setUser,
        setPassword,
        setEmail,
        setIsAddImg,
        formHandler,
        registerUser,
        loginUser,
        logOut,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export { UserContextProvider, UserContext };
