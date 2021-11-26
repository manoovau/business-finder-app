import React, { useEffect, useState } from "react";
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
} from "./interface";
import { URL_BASE, BEARER } from "./authentication/yelp-api/index";
import { Switch, Route, Link } from "react-router-dom";

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

  const [searchInputs, setSearchInputs] = useState<InputType>({
    business: DEFAULT_VALUE,
    where: DEFAULT_VALUE,
  });

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
  const [resultYELP, setResultYELP] = useState<ApiResponseType>({
    businesses: [],
    region: {
      center: {
        latitude: DEFAULT_NUMBER,
        longitude: DEFAULT_NUMBER,
      },
    },
    total: DEFAULT_NUMBER,
  });

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

  useEffect(
    () =>
      setTerm(
        `?term=${searchInputs.business}${searchInputs.where}&limit=${LIMIT}${filterValue.openFilter}${filterValue.priceFilter}${filterValue.sortByFilter}${filterValue.attrFilter}`,
      ),
    [searchInputs],
  );

  useEffect(() => {
    if (term !== `?term=${DEFAULT_VALUE}${DEFAULT_VALUE}&limit=${LIMIT}`)
      Promise.resolve(useFetchYELP(`${PATH}${term}`))
        .then((resp) => setResultYELP(resp))
        .catch((err) => console.error(err));
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
    if (resultYELP.businesses !== [])
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
    if (searchInputs.where === "") {
      (document.getElementById("where") as HTMLInputElement).placeholder =
        "Please, fill location field.";
    } else {
      (document.getElementById("where") as HTMLInputElement).placeholder = "Where...";
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
  console.log(term);
  console.log(searchInputs.where);
  console.log(resultYELP);

  return (
    <div className="App">
      <Switch>
        <Route exact path="/">
          <div id="home-container">
            <Header
              updateSearchInputs={updateSearchInputs}
              setFilterValue={setFilterValue}
              filterVal={filterValue}
            />
            {!resultYELP.total ? (
              DEFAULT_VALUE
            ) : (
              <button onClick={() => setIsMapView(!isMapView)}>
                {isMapView ? `See Results view` : `See Map View`}{" "}
              </button>
            )}

            <div id="result-container">
              <div className={isMapView ? "show" : "hide"}>
                <MapPage
                  setIdSelected={setIdSelected}
                  markers={markerResArr}
                  region={resultYELP.region.center}
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
          </div>
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
