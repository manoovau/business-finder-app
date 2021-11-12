import React, { useEffect, useState } from "react";
import "./App.css";
import { Header, ItemContainer, ItemInfo, MapPage, Footer } from "./component/index";
import {
  InputType,
  ItemInfoType,
  reviewsType,
  ApiResponseType,
  FilterInputType,
  MarkerType,
} from "./interface";
import { URL_BASE, BEARER } from "./hooks/yelp-api";
import { Switch, Route } from "react-router-dom";

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

function App() {
  const DEFAULT_VALUE = null;
  const DEFAULT_STRING = "default_string";
  const DEFAULT_NUMBER = 0;

  const [searchInputs, setSearchInputs] = useState<InputType>({
    business: DEFAULT_VALUE,
    where: DEFAULT_VALUE,
  });

  // YELP API LIMIT is 50
  const LIMIT = 50;
  const [term, setTerm] = useState<string>(
    `?term=${searchInputs.business}&location=${searchInputs.where}&limit=${LIMIT}`,
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

  const [isMapView, setIsMapView] = useState<boolean>(false);

  useEffect(
    () =>
      setTerm(
        `?term=${searchInputs.business}&location=${searchInputs.where}&limit=${LIMIT}${filterValue.openFilter}${filterValue.priceFilter}${filterValue.sortByFilter}${filterValue.attrFilter}`,
      ),
    [searchInputs],
  );

  useEffect(() => {
    if (term !== `?term=${DEFAULT_VALUE}&location=${DEFAULT_VALUE}&limit=${LIMIT}`)
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

  /**
   * set searchInputs values and check if where field is not filled.
   * @param objectIn Object with business and where input fields.
   */
  const updateSearchInputs = (objectIn: InputType): void => {
    setSearchInputs({ ...searchInputs, business: objectIn.business, where: objectIn.where });
    if (!searchInputs.where) {
      (document.getElementById("where") as HTMLInputElement).placeholder =
        "Please, fill location field.";
    } else {
      (document.getElementById("where") as HTMLInputElement).placeholder = "Where...";
    }
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
            />
            {resultYELP.total !== DEFAULT_NUMBER ? (
              <button onClick={() => setIsMapView(!isMapView)}>
                {isMapView ? `See Results view` : `See Map View`}{" "}
              </button>
            ) : (
              DEFAULT_VALUE
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
                <ItemContainer setIdSelected={setIdSelected} setMarkerResArr={setMarkerResArr}>
                  {resultYELP}
                </ItemContainer>
              </div>
            </div>
          </div>
        </Route>
        <Route path={`/${selectedBusiness.id}`}>
          <div>
            <ItemInfo
              id={selectedBusiness.id}
              name={selectedBusiness.name}
              rating={selectedBusiness?.rating}
              review_count={selectedBusiness?.review_count}
              price={selectedBusiness?.price}
              categories={selectedBusiness?.categories}
              is_closed={selectedBusiness?.is_closed}
              hours={selectedBusiness?.hours}
              location_disp={selectedBusiness?.location?.display_address}
              url={selectedBusiness?.url}
              phone={selectedBusiness?.phone}
              photosArr={selectedBusiness?.photos}
              setIdReviewData={setIdReviewData}
              revPos_lang={reviewData?.possible_languages}
              revArr={reviewData?.reviews}
              revTotal={reviewData.total}
            />
          </div>
        </Route>
      </Switch>
      <Footer />
    </div>
  );
}

export default App;
