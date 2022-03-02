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

  const { currentUsersId, userLocalInit } = useContext(UserContext);

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
            {currentUsersId !== userLocalInit ? <Redirect to="/" /> : <LoginPage />}
          </Route>
          <Route path="/register">
            {currentUsersId !== userLocalInit ? <Redirect to="/" /> : <RegisterPage />}
          </Route>
          <Route path="/profile">
            {currentUsersId === userLocalInit ? <Redirect to="/" /> : <ProfileContainer />}
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
