import React, { useEffect, useState } from "react";
import "./App.css";
import { Header, ItemContainer, ItemInfo, MapPage } from "./component/index";
import {
  InputType,
  ItemInfoType,
  reviewMainType,
  ApiResponseType,
  ItemInfoChildrenType,
  FilterInputType,
  MarkerType,
  MapPageChildrenType,
} from "./interface";
import { URL_BASE, BEARER } from "./hooks/yelp-api";
import { Switch, Route } from "react-router-dom";

// <div>Icons made by <a href="https://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
// url image not found
// <div>Icons made by <a href="https://www.flaticon.com/authors/payungkead" title="Payungkead">Payungkead</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
// icon rating
// <div>Icons made by <a href="https://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>

const requestHeaders: HeadersInit = {
  Authorization: BEARER,
  Origin: "localhost",
  withCredentials: "true",
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
        latitude: 0,
        longitude: 0,
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

  const [itemInfoChildren, setItemInfoChildren] = useState<ItemInfoChildrenType>({
    selectedBusiness: { id: DEFAULT_STRING, name: DEFAULT_STRING },
    reviewData: { total: DEFAULT_NUMBER },
  });

  const [markerResArr, setMarkerResArr] = useState<MarkerType[]>([]);
  const [mapPageChildren, setMapPageChildren] = useState<MapPageChildrenType>({});

  const [isMapView, setIsMapView] = useState<boolean>(false);

  useEffect(() => {
    if (markerResArr !== undefined)
      setMapPageChildren({ ...mapPageChildren, markers: [...markerResArr] });
  }, [markerResArr]);
  useEffect(() => {
    if (resultYELP?.region?.center)
      setMapPageChildren({ ...mapPageChildren, region: resultYELP.region.center });
  }, [resultYELP]);

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

  useEffect(() => {
    setItemInfoChildren({ ...itemInfoChildren, selectedBusiness: selectedBusiness });
  }, [selectedBusiness]);

  useEffect(() => {
    setItemInfoChildren({ ...itemInfoChildren, reviewData: reviewData });
  }, [reviewData]);

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
            <Header updateSearchInputs={updateSearchInputs} setFilterValue={setFilterValue}>
              {filterValue}
            </Header>
            <button onClick={() => setIsMapView(!isMapView)}>
              {isMapView ? `See Results view` : `See Map View`}{" "}
            </button>

            <div id="result-container">
              <div className={isMapView ? "show" : "hide"}>
                <MapPage setIdSelected={setIdSelected}>{mapPageChildren}</MapPage>
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
            <ItemInfo setIdReviewData={setIdReviewData}>{itemInfoChildren}</ItemInfo>
          </div>
        </Route>
      </Switch>
    </div>
  );
}

export default App;
