import React, { ChangeEvent, useEffect, useState, FormEvent } from "react";
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
  MapPageItem,
} from "./component/index";
import {
  InputType,
  ItemInfoType,
  reviewsType,
  BusinessesType,
  ApiErrorResponse,
  FilterInputType,
  MarkerType,
  CenterType,
} from "./interface";
import { URL_BASE, BEARER } from "./authentication/yelp-api/index";
import { Switch, Route, Link, Redirect } from "react-router-dom";

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

import { db, storage } from "./firebase-config";

import {
  getDownloadURL,
  ref,
  StorageError,
  uploadBytesResumable,
  UploadTaskSnapshot,
} from "firebase/storage";

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
 * @returns YELP API response
 */

const fetchYELP = async (
  fetchParameter: string,
): Promise<BusinessesType | ApiErrorResponse | ItemInfoType | reviewMainType> => {
  const URL = `${URL_BASE}${fetchParameter}`;

  const resp = await fetch(URL, {
    headers: requestHeaders,
  });

  const data: BusinessesType | ApiErrorResponse | ItemInfoType | reviewMainType = await resp.json();

  return data;
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
 * get data from YELP APi
 * @param url fetch YELP API url
 * @returns YELP API response or void
 */
export const fetchYELPAsyncFunc = async (
  url: string,
): Promise<BusinessesType | ApiErrorResponse | ItemInfoType | reviewMainType> => {
  try {
    return await fetchYELP(url);
  } catch (err: unknown) {
    return { error: { ok: false, description: err } };
  }
};

/**
 * get users list from firebase
 * @returns users firebase array response
 */
export const getUsersAsyncFunc = async (
  collectRef: CollectionReference<DocumentData>,
): Promise<void | QuerySnapshot<DocumentData>> => {
  try {
    return await getUsers(collectRef);
  } catch (err: unknown) {
    console.error(err);
  }
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
  const DEFAULT_STRING = "DEFAULT";
  const DEFAULT_NUMBER = 0;
  const DEFAULT_CURRENT_PAGE = 1;
  const ITEMS_BY_PAGE = 10;

  const init_YELP_API: BusinessesType = {
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
  const [businesses, setBusinesses] = useState<BusinessesType>(init_YELP_API);

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
  const [isDelConf, setIsDelConf] = useState<boolean>(false);

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
      setBusinesses(init_YELP_API);
    } else {
      const fetchResultsearch = async (): Promise<void> => {
        const resp = await fetchYELPAsyncFunc(`${PATH}${term}`);

        if ("error" in resp) {
          setBusinesses(init_YELP_API);
          setIsErrorLocation(true);
          setSearchInputs({ ...searchInputs, where: DEFAULT_VALUE });
        } else {
          if ("businesses" in resp) setBusinesses(resp);
          setIsErrorLocation(false);
        }
      };

      fetchResultsearch();
    }
  }, [term]);

  useEffect(() => {
    if (idSelected !== undefined) {
      const fetchSelBusiness = async (): Promise<void> => {
        const resp = await fetchYELPAsyncFunc(`/businesses/${idSelected}`);
        if ("id" in resp) setSelectedBusiness(resp);
      };
      fetchSelBusiness();
    }
  }, [idSelected]);

  useEffect(() => {
    if (idReviewData !== undefined) {
      const fetchRevData = async (): Promise<void> => {
        const resp = await fetchYELPAsyncFunc(`/businesses/${idReviewData}/reviews`);
        if ("total" in resp) setReviewData(resp);
      };
      fetchRevData();
    }
  }, [idReviewData]);

  useEffect(() => {
    if (businesses.businesses !== [] || businesses.businesses !== undefined)
      setPageInfo({
        ...pageInfo,
        currentPage: DEFAULT_CURRENT_PAGE,
        totalPage: getTotalPages(businesses.businesses.length, ITEMS_BY_PAGE),
      });
  }, [businesses.businesses]);

  useEffect(() => {
    const result: itemsPageType = setMaxMinItemsPage(pageInfo.currentPage, ITEMS_BY_PAGE);
    setItemsPage({ ...itemsPage, min: result.min, max: result.max });
  }, [pageInfo.currentPage]);

  useEffect(() => {
    businessPageArr.length = 0;
    coorResArr.length = 0;
    if (businesses.businesses !== [] || businesses.businesses !== undefined)
      businesses.businesses.map((item: ItemInfoType, index: number) => {
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
  }, [itemsPage.min, businesses.businesses]);

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
  const registerUser = (): void => {
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
  const updatePw = (): void => {
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
  const formHandler = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const target = e.target as HTMLInputElement;
    if (target.files !== null) {
      const file = target.files[0];
      uploadFile(file);
    }
  };

  const [users, setUsers] = useState<[] | QueryDocumentSnapshot<DocumentData>[]>([]);
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
    setUser("");
    setPassword("");
    setEmail("");
    setCurrentUsersId(userLocalInit);
  };

  return (
    <div className="App">
      <div id="content-container">
        <Switch>
          <Route exact path="/">
            <div id="home-container">
              <Header
                searchInputs={searchInputs}
                setSearchInputs={setSearchInputs}
                setFilterValue={setFilterValue}
                filterVal={filterValue}
                password={currentUsersId.password}
                avatar={currentUsersId.avatar}
                logOut={logOut}
                isErrorLocation={isErrorLocation}
                setIsErrorLocation={setIsErrorLocation}
              />
              {businesses.total !== 0 && (
                <button onClick={() => setIsMapView(!isMapView)}>
                  {isMapView ? `See Results view` : `See Map View`}
                </button>
              )}
              {businesses.total !== 0 && (
                <div id="result-container">
                  <div className={isMapView ? "show" : "hide"}>
                    <MapPage
                      setIdSelected={setIdSelected}
                      markers={markerResArr}
                      region={businesses.region.center}
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
              <div id="profile-contaimer">
                <div id="change-pw-container">
                  <Link to="/">
                    <h3>{`< Go Back `}</h3>
                  </Link>
                  <input
                    id="current-password"
                    type="text"
                    className={isCurrentPwError ? "error" : ""}
                    value={currentPw}
                    placeholder={currentPwPlaceholder}
                    onChange={(e: ChangeEvent<HTMLInputElement>): void =>
                      setCurrentPw(e.target.value)
                    }
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
                  <Link to="/">
                    <button onClick={updatePw}>Change Password</button>
                  </Link>
                </div>
                <div id="remove-account-container">
                  <button
                    className={isDelConf ? "hide" : "show"}
                    onClick={() => setIsDelConf(!isDelConf)}
                  >
                    REMOVE ACCOUNT
                  </button>
                  <div id="delete-confirm-container" className={isDelConf ? "show" : "hide"}>
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
              {selectedBusiness?.coordinates && (
                <div className={showReview ? "hide" : "show"}>
                  <MapPageItem region={selectedBusiness?.coordinates} />
                </div>
              )}
            </div>
          </Route>
        </Switch>
      </div>

      <Footer />
    </div>
  );
}

export default App;
