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
import { db } from "./firebase-config";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";

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
};

const userLocalInit = {
  id: "",
  username: "",
  password: "",
  email: "",
};

/**
 * fetch function. Get YELP API data from YELP API
 * @param url YELP API URL
 * @returns YELP API data
 */
const useFetchYELP = async (fetchParameter: string) => {
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

  return data;
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
  const whereElement = document.getElementById("where") as HTMLInputElement;

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

  const [isTypoLocation, setIsTypoLocation] = useState<boolean>(false);

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

  const [user, setUser] = useState<string | null>("");
  const [password, setPassword] = useState<string | null>("");
  const [email, setEmail] = useState<string | null>("");

  useEffect(
    () =>
      setTerm(
        `?term=${searchInputs.business}${searchInputs.where}&limit=${LIMIT}${filterValue.openFilter}${filterValue.priceFilter}${filterValue.sortByFilter}${filterValue.attrFilter}`,
      ),
    [searchInputs, filterValue],
  );

  useEffect(() => {
    if (!searchInputs.where) {
      setResultYELP(init_YELP_API);
    } else {
      Promise.resolve(useFetchYELP(`${PATH}${term}`))
        .then((resp) => {
          !resp.error ? setResultYELP(resp) : setResultYELP(init_YELP_API);
          resp.error ? setIsTypoLocation(true) : setIsTypoLocation(false);
        })
        .catch((err) => console.error(err));
    }
  }, [term]);

  useEffect(() => {
    if (idSelected !== undefined)
      Promise.resolve(useFetchYELP(`/businesses/${idSelected}`))
        .then((resp) => setSelectedBusiness(resp))
        .catch((err) => console.error(err));
  }, [idSelected]);

  useEffect(() => {
    if (idReviewData !== undefined)
      Promise.resolve(useFetchYELP(`/businesses/${idReviewData}/reviews`))
        .then((resp) => setReviewData(resp))
        .catch((err) => console.error(err));
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

  useEffect(() => {
    if (isTypoLocation) {
      whereElement.classList.add("error");
      whereElement.placeholder = "Please, fill a correct location";
      whereElement.value = "";
    }
  }, [isTypoLocation]);

  /**
   * set searchInputs values and check if where field is not filled.
   * @param objectIn Object with business and where input fields.
   */
  const updateSearchInputs = (objectIn: InputType): void => {
    setSearchInputs({ ...searchInputs, business: objectIn.business, where: objectIn.where });

    if (objectIn.where === DEFAULT_VALUE) {
      whereElement.placeholder = "Please, fill location field.";
      whereElement.classList.add("error");
    } else {
      whereElement.placeholder = "Where...";
      whereElement.classList.remove("error");
    }
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
  const createUser = async (user: string, password: string, email: string): Promise<void> => {
    await addDoc(usersCollecRef, {
      email: email,
      password: password,
      username: user,
    });
  };

  /**
   * update password field inside users firebase collection
   */
  const updateUser = async (): Promise<void> => {
    const userDoc = doc(db, "users", currentUsersId.id);
    await updateDoc(userDoc, { password: "nananana Batman" });
  };

  /**
   * delete user inside firebase collection
   */
  const deleteUser = async (): Promise<void> => {
    const userDoc = doc(db, "users", currentUsersId.id);
    await deleteDoc(userDoc);
  };

  /**
   * identify errors inside login input values and store correct user information
   */
  const loginUser = () => {
    const usernameLoginEle = document.getElementById("username-login") as HTMLInputElement;
    const passwordLoginEle = document.getElementById("password-login") as HTMLInputElement;

    usernameLoginEle.classList.remove("error");
    passwordLoginEle.classList.remove("error");

    if (!password) passwordLoginEle.placeholder = "password is empty";
    if (!user) {
      usernameLoginEle.placeholder = "username is empty";
    } else {
      const usernameFilter = usersLocal.filter((item: userLocalType) => item.username === user);
      if (usernameFilter.length === 0) {
        usernameLoginEle.classList.add("error");
        usernameLoginEle.placeholder = "username is not correct";
        usernameLoginEle.value = "";
        setUser("");
      } else if (usernameFilter.length > 0 && usernameFilter[0].password === password) {
        setCurrentUsersId(usernameFilter[0]);
      } else if (usernameFilter.length > 0 && usernameFilter[0].password !== password) {
        passwordLoginEle.classList.add("error");
        passwordLoginEle.placeholder = "password is not correct";
        passwordLoginEle.value = "";
        setCurrentUsersId(userLocalInit);
      }
    }
  };

  /**
   * identify errors inside register input values and store correct user registration information
   */
  const registerUser = () => {
    const usernameRegisterEle = document.getElementById("username-register") as HTMLInputElement;
    const passwordRegisterEle = document.getElementById("password-register") as HTMLInputElement;
    const emailRegisterEle = document.getElementById("email-register") as HTMLInputElement;

    usernameRegisterEle.classList.remove("error");
    passwordRegisterEle.classList.remove("error");
    emailRegisterEle.classList.remove("error");

    if (!password) {
      passwordRegisterEle.classList.add("error");
      passwordRegisterEle.placeholder = "password is empty";
    }

    if (!user) {
      usernameRegisterEle.placeholder = "username is empty";
      usernameRegisterEle.classList.add("error");
    }
    if (!email) {
      emailRegisterEle.placeholder = "email is empty";
      emailRegisterEle.classList.add("error");
    } else {
      const checkEmailInput = usersLocal.filter((item: userLocalType) => item.email === email);
      if (checkEmailInput.length > 0) {
        emailRegisterEle.value = "";
        emailRegisterEle.placeholder = "You are registered";
        emailRegisterEle.classList.add("error");
        setEmail("");
      } else {
        const checkUsernameInput = usersLocal.filter(
          (item: userLocalType) => item.username === user,
        );
        if (checkUsernameInput.length > 0) {
          setUser("");
          usernameRegisterEle.placeholder = "Please, use other username";
          usernameRegisterEle.value = "";
          usernameRegisterEle.classList.add("error");
        }
      }

      if (user && password && email)
        setCurrentUsersId({ ...currentUsersId, username: user, password: password, email: email });
    }
  };

  const [users, setUsers] = useState<[] | unknown[]>([]);
  const [currentUsersId, setCurrentUsersId] = useState<userLocalType>(userLocalInit);
  const usersCollecRef = collection(db, "users");
  const usersLocal: userLocalType[] = [];

  useEffect(() => {
    if (user && password && email)
      createUser(currentUsersId.username, currentUsersId.password, currentUsersId.email);
  }, [currentUsersId]);

  useEffect(() => {
    Promise.resolve(getUsers(usersCollecRef))
      .then((resp) => setUsers(resp.docs))
      .catch((err) => console.error(err));
  }, [user]);

  if (users.length > 0) users.map((doc: any) => usersLocal.push({ ...doc.data(), id: doc.id }));

  /**
   * store user input value
   * @param e user input value
   */
  const setUserInput = (e: ChangeEvent<HTMLInputElement>): void => setUser(e.target.value);

  /**
   * store password input value
   * @param e password input value
   */
  const setPasswordInput = (e: ChangeEvent<HTMLInputElement>): void => setPassword(e.target.value);

  /**
   * store email input value
   * @param e email input value
   */
  const setEmailInput = (e: ChangeEvent<HTMLInputElement>): void => setEmail(e.target.value);

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
              logOut={logOut}
            />
            <button onClick={() => createUser("user", "password", "email")}>Create User</button>
            <button onClick={updateUser}>Update User</button>
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
                placeholder="username"
                onChange={setUserInput}
                required
              />
              <input
                id="password-login"
                type="text"
                placeholder="password"
                onChange={setPasswordInput}
                required
              />
              <button onClick={loginUser}>Login In</button>
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
                placeholder="username"
                onChange={setUserInput}
              />
              <input
                id="password-register"
                type="text"
                placeholder="password"
                onChange={setPasswordInput}
              />
              <input id="email-register" type="text" placeholder="email" onChange={setEmailInput} />
              <button onClick={registerUser}>Register</button>
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
