import React, { useEffect, useState, useContext } from "react";
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
  ProfileContainer,
  LoginPage,
  RegisterPage,
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
import { UserContext } from "./context/UserContext";

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

const DEFAULT_VALUES = {
  NULL: null,
  STRING: "DEFAULT",
  EMPTY_STRING: "",
  NUMBER: 0,
  UNIT: 1,
  ITEMS_BY_PAGE: 10,
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
  console.log(fetchParameter);
  console.log(data);
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
    console.log("Error");
    console.log(typeof err);
    console.log(err);
    return { error: { ok: true, description: err } };
  }
};

/**
 * Set the minimum and maximum index values for the items display by page, based on the current page and the items allowed by page
 * @param page current page
 * @param itemsByPage items allowed by page
 * @returns Object with min and max items per page value
 */
export const setMaxMinItemsPage = (page: number, itemsByPage: number): itemsPageType => {
  if (page === DEFAULT_VALUES.UNIT) return { min: DEFAULT_VALUES.NUMBER, max: itemsByPage };
  return { min: (page - DEFAULT_VALUES.UNIT) * itemsByPage, max: page * itemsByPage };
};

/**
 * Calculate the amount of pages needed based on the total number of items and the number of item by page
 * @param totalItem total ampunt of item/s
 * @param itemByPage item/s allowed by page
 * @returns total amount of pages needed
 */
export const getTotalPages = (totalItem: number, itemByPage: number): number => {
  if (totalItem <= itemByPage) return DEFAULT_VALUES.UNIT;
  return (totalItem / itemByPage) % DEFAULT_VALUES.UNIT === DEFAULT_VALUES.NUMBER
    ? totalItem / itemByPage
    : Math.floor(totalItem / itemByPage) + DEFAULT_VALUES.UNIT;
};

const App = (): JSX.Element => {
  const { currentUsersId, userLocalInit } = useContext(UserContext);

  const init_YELP_API: BusinessesType = {
    businesses: [],
    region: {
      center: {
        latitude: DEFAULT_VALUES.NUMBER,
        longitude: DEFAULT_VALUES.NUMBER,
      },
    },
    total: DEFAULT_VALUES.NUMBER,
  };

  const [searchInputs, setSearchInputs] = useState<InputType>({
    business: DEFAULT_VALUES.NULL,
    where: DEFAULT_VALUES.NULL,
  });

  const [isErrorLocation, setIsErrorLocation] = useState<boolean>(false);
  const [isErrorBusiness, setIsErrorBusiness] = useState<boolean>(false);
  const [isErrorCors, setIsErrorCors] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string>(DEFAULT_VALUES.EMPTY_STRING);

  // YELP API LIMIT is 50
  const LIMIT = 50;
  const [term, setTerm] = useState<string>(
    `?term=${searchInputs.business}${searchInputs.where}&limit=${LIMIT}`,
  );
  const [filterValue, setFilterValue] = useState<FilterInputType>({
    openFilter: DEFAULT_VALUES.EMPTY_STRING,
    priceFilter: DEFAULT_VALUES.EMPTY_STRING,
    sortByFilter: DEFAULT_VALUES.EMPTY_STRING,
    attrFilter: DEFAULT_VALUES.EMPTY_STRING,
  });
  const PATH = "/businesses/search";
  const [businesses, setBusinesses] = useState<BusinessesType>(init_YELP_API);

  const [selectedBusiness, setSelectedBusiness] = useState<ItemInfoType>({
    id: DEFAULT_VALUES.STRING,
    name: DEFAULT_VALUES.STRING,
  });
  const [idSelected, setIdSelected] = useState<string>();
  const [idReviewData, setIdReviewData] = useState<string>();
  const [reviewData, setReviewData] = useState<reviewMainType>({ total: DEFAULT_VALUES.NUMBER });

  const [markerResArr, setMarkerResArr] = useState<MarkerType[]>([]);
  const [businessPage, setBusinessPage] = useState<ItemInfoType[]>([]);

  const [isMapView, setIsMapView] = useState<boolean>(false);

  const [showReview, setShowReview] = useState<boolean>(false);

  const [pageInfo, setPageInfo] = useState<pageInfoType>({
    currentPage: DEFAULT_VALUES.UNIT,
    totalPage: DEFAULT_VALUES.NUMBER,
  });

  const [itemsPage, setItemsPage] = useState<itemsPageType>({
    min: DEFAULT_VALUES.NUMBER,
    max: DEFAULT_VALUES.ITEMS_BY_PAGE,
  });

  const businessPageArr: ItemInfoType[] = [];

  const coorResArr: MarkerType[] = [];

  useEffect((): void => {
    setTerm(
      `?term=${searchInputs.business}${searchInputs.where}&limit=${LIMIT}${filterValue.openFilter}${filterValue.priceFilter}${filterValue.sortByFilter}${filterValue.attrFilter}`,
    );
  }, [searchInputs, filterValue]);

  useEffect((): void => {
    if (searchInputs.where === DEFAULT_VALUES.EMPTY_STRING) setIsErrorLocation(false);

    if (!searchInputs.where) {
      setBusinesses(init_YELP_API);
    } else {
      const fetchResultsearch = async (): Promise<void> => {
        const resp = await fetchYELPAsyncFunc(`${PATH}${term}`);
        console.log(resp);
        if ("error" in resp) {
          setBusinesses(init_YELP_API);
          if (resp.error.code === "LOCATION_NOT_FOUND") {
            setIsErrorLocation(true);
            setSearchInputs({ ...searchInputs, where: DEFAULT_VALUES.NULL });
          } else {
            // error: Object { ok: false, description: SyntaxError }
            console.log("SET is error CORS");
            setIsErrorCors(true);
          }
        } else {
          if ("businesses" in resp) setBusinesses(resp);
          setIsErrorLocation(false);
          setIsErrorCors(false);
          setIsErrorCors(false);
        }
      };

      fetchResultsearch();
    }
  }, [term]);

  useEffect((): void => {
    setTimeout(() => {
      if (
        businesses.total === DEFAULT_VALUES.NUMBER &&
        searchInputs.business !== DEFAULT_VALUES.NULL &&
        !isErrorCors
      ) {
        setLocationError(`No results for: ${searchInputs.business}`);
      } else if (businesses.total !== DEFAULT_VALUES.NUMBER) {
        setLocationError(DEFAULT_VALUES.EMPTY_STRING);
      }
    }, 1000);
  }, [businesses]);

  useEffect((): void => {
    if (idSelected !== undefined) {
      const fetchSelBusiness = async (): Promise<void> => {
        const resp = await fetchYELPAsyncFunc(`/businesses/${idSelected}`);
        if ("id" in resp) setSelectedBusiness(resp);
      };
      fetchSelBusiness();
    }
  }, [idSelected]);

  useEffect((): void => {
    if (idReviewData !== undefined) {
      const fetchRevData = async (): Promise<void> => {
        const resp = await fetchYELPAsyncFunc(`/businesses/${idReviewData}/reviews`);
        if ("total" in resp) setReviewData(resp);
      };
      fetchRevData();
    }
  }, [idReviewData]);

  useEffect((): void => {
    if (businesses.businesses.length > 0 || businesses.businesses !== undefined)
      setPageInfo({
        ...pageInfo,
        currentPage: DEFAULT_VALUES.UNIT,
        totalPage: getTotalPages(businesses.businesses.length, DEFAULT_VALUES.ITEMS_BY_PAGE),
      });
  }, [businesses.businesses]);

  useEffect((): void => {
    const result: itemsPageType = setMaxMinItemsPage(
      pageInfo.currentPage,
      DEFAULT_VALUES.ITEMS_BY_PAGE,
    );
    setItemsPage({ ...itemsPage, min: result.min, max: result.max });
  }, [pageInfo.currentPage]);

  useEffect((): void => {
    businessPageArr.length = DEFAULT_VALUES.NUMBER;
    coorResArr.length = DEFAULT_VALUES.NUMBER;
    if (businesses.businesses.length > 0 || businesses.businesses !== undefined)
      businesses.businesses.map((item: ItemInfoType, index: number) => {
        if (index >= itemsPage.min && index < itemsPage.max) {
          let url = DEFAULT_VALUES.EMPTY_STRING;
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
    setPageInfo({ ...pageInfo, currentPage: pageInfo.currentPage + DEFAULT_VALUES.UNIT });
    window.scrollTo(DEFAULT_VALUES.NUMBER, DEFAULT_VALUES.NUMBER);
  };

  /**
   * decrement PageInfo Object, key currentPage value
   */
  const decrementPage = (): void => {
    setPageInfo({ ...pageInfo, currentPage: pageInfo.currentPage - DEFAULT_VALUES.UNIT });
    window.scrollTo(DEFAULT_VALUES.NUMBER, DEFAULT_VALUES.NUMBER);
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

  return (
    <div className="text-center flex flex-col h-screen justify-between">
      <div id="content-container">
        <Switch>
          <Route exact path="/">
            <div id="home-container">
              <Header
                searchInputs={searchInputs}
                setSearchInputs={setSearchInputs}
                setFilterValue={setFilterValue}
                filterVal={filterValue}
                isErrorLocation={isErrorLocation}
                isErrorBusiness={isErrorBusiness}
                setIsErrorLocation={setIsErrorLocation}
                setIsErrorBusiness={setIsErrorBusiness}
              />
              {isErrorCors && (
                <p>
                  Please, visit the site: https://cors-anywhere.herokuapp.com/corsdemo cors-anywhere{" "}
                </p>
              )}
              {!isErrorCors && <p>{locationError}</p>}
              {businesses.total !== DEFAULT_VALUES.NUMBER && (
                <button className="block sm:hidden" onClick={() => setIsMapView(!isMapView)}>
                  {isMapView ? `See Results view` : `See Map View`}
                </button>
              )}
              {businesses.total !== DEFAULT_VALUES.NUMBER && (
                <div id="result-container" className="flex flex-row flex-wrap">
                  <div
                    className={isMapView ? "sm:block sm:w-1/3 hidden" : "sm:w-1/3 sm:block w-full"}
                  >
                    <div id="item-pagin-result-container" className="max-w-xlreact-hoo">
                      <ItemContainer setIdSelected={setIdSelected} resultYELPBus={businessPage} />
                    </div>
                  </div>
                  <div
                    className={isMapView ? "sm:w-2/3 sm:block w-full " : "sm:block sm:w-2/3 hidden"}
                  >
                    <MapPage
                      setIdSelected={setIdSelected}
                      markers={markerResArr}
                      region={businesses.region.center}
                      updateLocationClick={updateLocationClick}
                    />
                  </div>
                  <Pagination
                    incrementPage={incrementPage}
                    decrementPage={decrementPage}
                    currentPage={pageInfo.currentPage}
                    totalPage={pageInfo.totalPage}
                  />
                </div>
              )}
            </div>
          </Route>
          <Route path="/login">
            {currentUsersId !== userLocalInit ? <Redirect to="/" /> : <LoginPage />}
          </Route>
          <Route path="/register">
            {currentUsersId !== userLocalInit ? <Redirect to="/" /> : <RegisterPage />}
          </Route>
          <Route path="/profile">
            {currentUsersId === userLocalInit ? <Redirect to="/" /> : <ProfileContainer />}
          </Route>
          <Route path={`/${selectedBusiness.id}`}>
            <div className="mt-0 mx-auto mb-4 flex flex-col justify-center  ">
              <div className="flex flex-col justify-center">
                {" "}
                <Link to="/" id="title" className="lg:w-[1280px] flex justify-start mx-auto my-4">
                  <h3>{`< Go Back `}</h3>
                </Link>
                <div className="flex justify-center">
                  <BasicInfoProd
                    name={selectedBusiness.name}
                    rating={selectedBusiness?.rating}
                    review_count={selectedBusiness?.review_count}
                    price={selectedBusiness?.price}
                    categories={selectedBusiness?.categories}
                    is_closed={selectedBusiness?.is_closed}
                    is_item_info={true}
                  />
                </div>
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
              </div>

              <div className={showReview ? "block" : "hidden"}>
                <ItemReview
                  url={selectedBusiness?.url}
                  revPos_lang={reviewData?.possible_languages}
                  revArr={reviewData?.reviews}
                  revTotal={reviewData.total}
                />
              </div>
              {selectedBusiness?.coordinates && (
                <div className={showReview ? "hidden" : "flex justify-center my-4"}>
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
};

export default App;
