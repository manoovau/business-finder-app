import React, { ChangeEvent, useEffect, useState } from "react";
import "./App.css";
import {
  Header,
  ItemContainer,
  ItemInfo,
  MapPage,
  Footer,
  BasicInfoProd,
  ItemReview,
  Pagination,
} from "./component/index";
import {
  InputType,
  ItemInfoType,
  reviewsType,
  ApiResponseType,
  FilterInputType,
  MarkerType,
  CenterType,
} from "./interface";
import { URL_BASE, BEARER } from "./authentication/yelp-api/index";
import { Switch, Route, Link, Redirect } from "react-router-dom";

import { CollectionReference, DocumentData } from "@firebase/firestore-types";

import { db, storage } from "./firebase-config";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

const requestHeaders: HeadersInit = {
  Authorization: BEARER,
  Origin: "localhost",
  withCredentials: "true",
};

type reviewMainType = {
  possible_languages?: string[];
  reviews?: reviewsType[];
  total: number;
};

type pageInfoType = {
  currentPage: number;
  totalPage: number;
};

type itemsPageType = {
  min: number;
  max: number;
};

type userLocalType = {
  id: string;
  username: string;
  password: string;
  email: string;
  avatar: string;
};

const userLocalInit = {
  id: "",
  username: "",
  password: "",
  email: "",
  avatar: "",
};

/**
 * fetch function. Get YELP API data from YELP API
 * @param url YELP API URL
 * @returns YELP API data
 */
const fetchYELP = async (fetchParameter: string) => {
  const URL = `${URL_BASE}${fetchParameter}`;

  const resp = await fetch(URL, {
    headers: requestHeaders,
  });
  const data = await resp.json();
  return data;
};

/**
 * get data from firebase
 * @param usersCollecRef firebase collection
 * @returns data from firebase
 */
const getUsers = async (usersCollecRef: CollectionReference<DocumentData> | any) => {
  const data = await getDocs(usersCollecRef);

  return data.docs;
};

/**
 * Set the minimum and maximum index values for the items display by page, based on the current page and the items allowed by page
 * @param page current page
 * @param itemsByPage items allowed by page
 * @returns Object with min and max items per page value
 */
export const setMaxMinItemsPage = (page: number, itemsByPage: number): itemsPageType => {
  if (page === 1) return { min: 0, max: itemsByPage };
  return { min: (page - 1) * itemsByPage, max: page * itemsByPage };
};

/**
 * Calculate the amount of pages needed based on the total number of items and the number of item by page
 * @param totalItem total ampunt of item/s
 * @param itemByPage item/s allowed by page
 * @returns total amount of pages needed
 */
export function getTotalPages(totalItem: number, itemByPage: number): number {
  if (totalItem <= itemByPage) return 1;
  return (totalItem / itemByPage) % 1 === 0
    ? totalItem / itemByPage
    : Math.floor(totalItem / itemByPage) + 1;
}

function App() {
  const DEFAULT_VALUE = null;
  const DEFAULT_STRING = "default_string";
  const DEFAULT_NUMBER = 0;
  const DEFAULT_CURRENT_PAGE = 1;
  const ITEMS_BY_PAGE = 10;

  const init_YELP_API: ApiResponseType = {
    businesses: [],
    region: {
      center: {
        latitude: DEFAULT_NUMBER,
        longitude: DEFAULT_NUMBER,
      },
    },
    total: DEFAULT_NUMBER,
  };

  const [searchInputs, setSearchInputs] = useState<InputType>({
    business: DEFAULT_VALUE,
    where: DEFAULT_VALUE,
  });

  const [isErrorLocation, setIsErrorLocation] = useState<boolean>(false);

  // YELP API LIMIT is 50
  const LIMIT = 50;
  const [term, setTerm] = useState<string>(
    `?term=${searchInputs.business}${searchInputs.where}&limit=${LIMIT}`,
  );
  const [filterValue, setFilterValue] = useState<FilterInputType>({
    openFilter: ``,
    priceFilter: ``,
    sortByFilter: ``,
    attrFilter: ``,
  });
  const PATH = "/businesses/search";
  const [resultYELP, setResultYELP] = useState<ApiResponseType>(init_YELP_API);

  const [selectedBusiness, setSelectedBusiness] = useState<ItemInfoType>({
    id: DEFAULT_STRING,
    name: DEFAULT_STRING,
  });
  const [idSelected, setIdSelected] = useState<string>();
  const [idReviewData, setIdReviewData] = useState<string>();
  const [reviewData, setReviewData] = useState<reviewMainType>({ total: DEFAULT_NUMBER });

  const [markerResArr, setMarkerResArr] = useState<MarkerType[]>([]);
  const [businessPage, setBusinessPage] = useState<ItemInfoType[]>([]);

  const [isMapView, setIsMapView] = useState<boolean>(false);

  const [showReview, setShowReview] = useState<boolean>(false);

  const [pageInfo, setPageInfo] = useState<pageInfoType>({
    currentPage: DEFAULT_CURRENT_PAGE,
    totalPage: DEFAULT_NUMBER,
  });

  const [itemsPage, setItemsPage] = useState<itemsPageType>({
    min: DEFAULT_NUMBER,
    max: ITEMS_BY_PAGE,
  });

  const businessPageArr: ItemInfoType[] = [];

  const coorResArr: MarkerType[] = [];

  const [user, setUser] = useState<string>("");
  const [userInPlaceholder, setUserInPlaceholder] = useState<string>("username");
  const [isUserInError, setIsUserInError] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [pwInPlaceholder, setPwInPlaceholder] = useState<string>("password");
  const [isPwInError, setIsPwInError] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [emailInPlaceholder, setEmailInPlaceholder] = useState<string>("email");
  const [isEmailInError, setIsEmailInError] = useState<boolean>(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [registerCount, setRegisterCount] = useState<number>(0);
  const [currentPw, setCurrentPw] = useState<string>("");
  const [currentPwPlaceholder, setCurrentPwPlaceholder] = useState<string>("Fill current password");
  const [isCurrentPwError, setIsCurrentPwError] = useState<boolean>(false);
  const [newPw1, setNewPw1] = useState<string>("");
  const [newPw1Placeholder, setNewPw1Placeholder] = useState<string>("Fill new password");
  const [isNewPwPw1Error, setIsNewPwPw1Error] = useState<boolean>(false);
  const [newPw2, setNewPw2] = useState<string>("");
  const [newPw2Placeholder, setNewPw2Placeholder] = useState<string>("Repeat new password");

  useEffect(
    () =>
      setTerm(
        `?term=${searchInputs.business}${searchInputs.where}&limit=${LIMIT}${filterValue.openFilter}${filterValue.priceFilter}${filterValue.sortByFilter}${filterValue.attrFilter}`,
      ),
    [searchInputs, filterValue],
  );

  useEffect(() => {
    if (searchInputs.where === "") setIsErrorLocation(true);

    if (!searchInputs.where) {
      setResultYELP(init_YELP_API);
    } else {
      const fetchResultsearch = async () => {
        const resp = await fetchYELPAsyncFunc(`${PATH}${term}`);
        if (!resp.error) {
          setResultYELP(resp);
          setIsErrorLocation(false);
        } else {
          setResultYELP(init_YELP_API);
          setIsErrorLocation(true);
          setSearchInputs({ ...searchInputs, where: "" });
          console.error(resp.error.description);
        }
      };
      fetchResultsearch();
    }
  }, [term]);

  const fetchYELPAsyncFunc = async (url: string): Promise<void | ItemInfoType | any> => {
    try {
      return await fetchYELP(url);
    } catch (err) {
      console.error(err);
    }
  };

  const getUsersAsyncFunc = async () => {
    try {
      return await getUsers(usersCollecRef);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (idSelected !== undefined) {
      const fetchSelBusiness = async () => {
        setSelectedBusiness(await fetchYELPAsyncFunc(`/businesses/${idSelected}`));
      };
      fetchSelBusiness();
    }
  }, [idSelected]);

  useEffect(() => {
    if (idReviewData !== undefined) {
      const fetchRevData = async () => {
        setReviewData(await fetchYELPAsyncFunc(`/businesses/${idReviewData}/reviews`));
      };
      fetchRevData();
    }
  }, [idReviewData]);

  useEffect(() => {
    if (resultYELP.businesses !== [] || resultYELP.businesses !== undefined)
      setPageInfo({
        ...pageInfo,
        currentPage: DEFAULT_CURRENT_PAGE,
        totalPage: getTotalPages(resultYELP.businesses.length, ITEMS_BY_PAGE),
      });
  }, [resultYELP.businesses]);

  useEffect(() => {
    const result: itemsPageType = setMaxMinItemsPage(pageInfo.currentPage, ITEMS_BY_PAGE);
    setItemsPage({ ...itemsPage, min: result.min, max: result.max });
  }, [pageInfo.currentPage]);

  useEffect(() => {
    businessPageArr.length = 0;
    coorResArr.length = 0;
    if (resultYELP.businesses !== [] || resultYELP.businesses !== undefined)
      resultYELP.businesses.map((item: ItemInfoType, index: number) => {
        if (index >= itemsPage.min && index < itemsPage.max) {
          let url = "";
          if (!item?.image_url) {
            url = `/img/nullPicture.png`;
          } else {
            url = item.image_url;
          }

          if (item?.coordinates)
            coorResArr.push({
              coord: item.coordinates,
              idCoord: item.id,
              nameCoord: item.name,
              imgCoord: url,
              ratingCoord: item.rating,
            });
          businessPageArr.push(item);
        }
      });

    setMarkerResArr([...coorResArr]);
    setBusinessPage([...businessPageArr]);
  }, [itemsPage.min, resultYELP.businesses]);

  /**
   * set searchInputs values and check if where field is not filled.
   * @param objectIn Object with business and where input fields.
   */
  const updateSearchInputs = (objectIn: InputType): void => {
    setSearchInputs({ ...searchInputs, business: objectIn.business, where: objectIn.where });
  };

  /**
   * increment PageInfo Object, key currentPage value
   */
  const incrementPage = (): void => {
    setPageInfo({ ...pageInfo, currentPage: pageInfo.currentPage + 1 });
    window.scrollTo(0, 0);
  };

  /**
   * decrement PageInfo Object, key currentPage value
   */
  const decrementPage = (): void => {
    setPageInfo({ ...pageInfo, currentPage: pageInfo.currentPage - 1 });
    window.scrollTo(0, 0);
  };

  /**
   * set location filter
   * @param location altitude and latitude location object
   */
  const updateLocationClick = (location: CenterType): void => {
    setSearchInputs({
      ...searchInputs,
      where: `&latitude=${location.latitude}&longitude=${location.longitude}`,
    });
  };

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
  };

  /**
   * identify errors inside login input values and allow to access user account
   */
  const loginUser = () => {
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
        setUser("");
      } else if (usernameFilter.length > 0 && usernameFilter[0].password === password) {
        setCurrentUsersId(usernameFilter[0]);
        setIsUserInError(false);
      } else if (usernameFilter.length > 0 && usernameFilter[0].password !== password) {
        setIsPwInError(true);
        setPwInPlaceholder("password is not correct");
        setPassword("");
        setCurrentUsersId(userLocalInit);
      }
    }
  };

  /**
   * identify errors inside register input values and store correct user registration information
   */
  const registerUser = () => {
    setIsUserInError(false);
    setIsPwInError(false);
    setIsEmailInError(false);

    if (!password) {
      setIsPwInError(true);
      setPwInPlaceholder("password is empty");
    }

    if (!user) {
      setUserInPlaceholder("username is empty");
      setIsUserInError(true);
    }
    if (!email) {
      setEmailInPlaceholder("email is empty");
      setIsEmailInError(true);
    } else {
      const checkEmailInput = usersLocal.filter((item: userLocalType) => item.email === email);
      if (checkEmailInput.length > 0) {
        setEmailInPlaceholder("You are register");

        setIsEmailInError(true);
        setEmail("");
      } else {
        const checkUsernameInput = usersLocal.filter(
          (item: userLocalType) => item.username === user,
        );
        if (checkUsernameInput.length > 0) {
          setUser("");
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
  const updatePw = () => {
    if (currentPw !== currentUsersId.password) {
      setIsCurrentPwError(true);
      setCurrentPwPlaceholder("Password is not correct");
    } else {
      setIsCurrentPwError(false);
      setCurrentPwPlaceholder("Fill current password");
      if (newPw1 !== newPw2) {
        setIsNewPwPw1Error(true);
        setNewPw1Placeholder("New Password is not equal");
        setNewPw2Placeholder("");
      } else {
        setIsNewPwPw1Error(false);
        setCurrentPw("");

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
  const uploadFile = (file: any) => {
    if (!file) return;

    const storageRef = ref(storage, `/files/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        setProgress(Math.round(snapshot.bytesTransferred / snapshot.totalBytes) * 100);
      },
      (err) => console.error(err),
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((url) => setAvatarUrl(url));
      },
    );
  };

  /**
   * extract file input and run firebase upload function
   * @param e file input value
   */
  const formHandler = (e: any) => {
    e.preventDefault();
    const file = e.target[0].files[0];
    uploadFile(file);
  };

  const [users, setUsers] = useState<[] | unknown[]>([]);
  const [currentUsersId, setCurrentUsersId] = useState<userLocalType>(userLocalInit);
  const usersCollecRef = collection(db, "users");
  const usersLocal: userLocalType[] = [];

  const [addImg, setAddImg] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

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
    if (currentUsersId.id === "" && currentUsersId.username !== "") {
      const usernameFilter: userLocalType[] = usersLocal.filter(
        (item: userLocalType) => item.username === user,
      );

      if (usernameFilter[0] !== undefined)
        setCurrentUsersId({ ...currentUsersId, id: usernameFilter[0].id });
    }
  }, [usersLocal]);

  useEffect(() => {
    const getUsersData = async () => {
      const resp = await getUsersAsyncFunc();
      if (resp !== undefined) setUsers(resp);
    };
    getUsersData();
  }, [user, registerCount]);

  if (users.length > 0) users.map((doc: any) => usersLocal.push({ ...doc.data(), id: doc.id }));

  /**
   * set initial values for user, password, email amd currentUsersId
   */
  const logOut = () => {
    setUser("");
    setPassword("");
    setEmail("");
    setCurrentUsersId(userLocalInit);
  };

  return (
    <div className="App">
      <Switch>
        <Route exact path="/">
          <div id="home-container">
            <Header
              updateSearchInputs={updateSearchInputs}
              setFilterValue={setFilterValue}
              filterVal={filterValue}
              password={currentUsersId.password}
              avatar={currentUsersId.avatar}
              logOut={logOut}
              isErrorLocation={isErrorLocation}
              setIsErrorLocation={setIsErrorLocation}
            />
            <button onClick={() => createUser("user", "password", "email", "avatar")}>
              Create User
            </button>
            <button onClick={() => updateUser("change")}>Update User</button>
            <button onClick={deleteUser}>Delete User</button>
            {!resultYELP.total ? (
              DEFAULT_VALUE
            ) : (
              <button onClick={() => setIsMapView(!isMapView)}>
                {isMapView ? `See Results view` : `See Map View`}
              </button>
            )}
            {!resultYELP.total ? (
              DEFAULT_VALUE
            ) : (
              <div id="result-container">
                <div className={isMapView ? "show" : "hide"}>
                  <MapPage
                    setIdSelected={setIdSelected}
                    markers={markerResArr}
                    region={resultYELP.region.center}
                    updateLocationClick={updateLocationClick}
                  />
                </div>
                <div className={isMapView ? "hide" : "show"}>
                  <div id="item-pagin-result-container">
                    <ItemContainer setIdSelected={setIdSelected} resultYELPBus={businessPage} />
                    <Pagination
                      incrementPage={incrementPage}
                      decrementPage={decrementPage}
                      currentPage={pageInfo.currentPage}
                      totalPage={pageInfo.totalPage}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </Route>
        <Route path="/login">
          {currentUsersId !== userLocalInit ? (
            <Redirect to="/" />
          ) : (
            <div>
              <Link to="/">
                <h3>{`< Go Back `}</h3>
              </Link>
              <input
                id="username-login"
                type="text"
                className={isUserInError ? "error" : ""}
                value={user}
                placeholder={userInPlaceholder}
                onChange={(e: ChangeEvent<HTMLInputElement>): void => setUser(e.target.value)}
                required
              />
              <input
                id="password-login"
                type="text"
                className={isPwInError ? "error" : ""}
                value={password}
                placeholder={pwInPlaceholder}
                onChange={(e: ChangeEvent<HTMLInputElement>): void => setPassword(e.target.value)}
                required
              />
              <button onClick={loginUser}>Login</button>
            </div>
          )}
        </Route>
        <Route path="/register">
          {currentUsersId !== userLocalInit ? (
            <Redirect to="/" />
          ) : (
            <div>
              <Link to="/">
                <h3>{`< Go Back `}</h3>
              </Link>
              <input
                id="username-register"
                type="text"
                className={isUserInError ? "error" : ""}
                value={user}
                placeholder={userInPlaceholder}
                onChange={(e: ChangeEvent<HTMLInputElement>): void => setUser(e.target.value)}
              />
              <input
                id="password-register"
                type="text"
                className={isPwInError ? "error" : ""}
                value={password}
                placeholder={pwInPlaceholder}
                onChange={(e: ChangeEvent<HTMLInputElement>): void => setPassword(e.target.value)}
              />
              <input
                id="email-register"
                type="text"
                className={isEmailInError ? "error" : ""}
                value={email}
                placeholder={emailInPlaceholder}
                onChange={(e: ChangeEvent<HTMLInputElement>): void => setEmail(e.target.value)}
              />
              <div id="add-img" onClick={() => setAddImg(!addImg)}>
                <form onSubmit={formHandler}>
                  <input type="file" className="input" />
                  <button type="submit">Upload</button>
                </form>
                <hr />
                <h2>Uploading {progress}%</h2>
              </div>
              <button onClick={registerUser}>Register</button>
            </div>
          )}
        </Route>
        <Route path="/profile">
          {currentUsersId === userLocalInit ? (
            <Redirect to="/" />
          ) : (
            <div>
              <Link to="/">
                <h3>{`< Go Back `}</h3>
              </Link>
              <input
                id="current-password"
                type="text"
                className={isCurrentPwError ? "error" : ""}
                value={currentPw}
                placeholder={currentPwPlaceholder}
                onChange={(e: ChangeEvent<HTMLInputElement>): void => setCurrentPw(e.target.value)}
                required
              />
              <input
                id="new-password"
                type="text"
                className={isNewPwPw1Error ? "error" : ""}
                value={newPw1}
                placeholder={newPw1Placeholder}
                onChange={(e: ChangeEvent<HTMLInputElement>): void => setNewPw1(e.target.value)}
                required
              />
              <input
                id="new-password"
                type="text"
                className={isNewPwPw1Error ? "error" : ""}
                value={newPw2}
                placeholder={newPw2Placeholder}
                onChange={(e: ChangeEvent<HTMLInputElement>): void => setNewPw2(e.target.value)}
                required
              />
              <button onClick={updatePw}>Change Password</button>
            </div>
          )}
        </Route>
        <Route path={`/${selectedBusiness.id}`}>
          <div>
            <Link to="/" id="title">
              <h3>{`< Go Back `}</h3>
            </Link>
            <BasicInfoProd
              name={selectedBusiness.name}
              rating={selectedBusiness?.rating}
              review_count={selectedBusiness?.review_count}
              price={selectedBusiness?.price}
              categories={selectedBusiness?.categories}
              is_closed={selectedBusiness?.is_closed}
            />
            <ItemInfo
              id={selectedBusiness.id}
              hours={selectedBusiness?.hours}
              location_disp={selectedBusiness?.location?.display_address}
              url={selectedBusiness?.url}
              phone={selectedBusiness?.phone}
              photosArr={selectedBusiness?.photos}
              coordinates={selectedBusiness?.coordinates}
              showReview={showReview}
              setIdReviewData={setIdReviewData}
              setShowReview={setShowReview}
            />

            <div className={showReview ? "show" : "hide"}>
              <ItemReview
                url={selectedBusiness?.url}
                revPos_lang={reviewData?.possible_languages}
                revArr={reviewData?.reviews}
                revTotal={reviewData.total}
              />
            </div>
          </div>
        </Route>
      </Switch>
      <Footer />
    </div>
  );
}

export default App;
