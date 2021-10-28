import React, { useEffect, useState } from "react";
import "./App.css";
import { Header, ItemContainer, ItemInfo } from "./component/index";
import {
  InputType,
  ItemInfoType,
  reviewMainType,
  ApiResponseType,
  ItemInfoChildrenType,
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

  const [resultYELP, setResultYELP] = useState<ApiResponseType>({
    businesses: [],
    region: {},
    total: DEFAULT_NUMBER,
  });

  const [selectedBusiness, setSelectedBusiness] = useState<ItemInfoType>({
    id: DEFAULT_STRING,
    name: DEFAULT_STRING,
  });
  const [idSelected, setIdSelected] = useState<string>();
  const [idReviewData, setIdReviewData] = useState<string>();
  const [reviewData, setReviewData] = useState<reviewMainType>({ total: DEFAULT_NUMBER });

  const LIMIT = 20;
  const [term, setTerm] = useState<string>(
    `?term=${searchInputs.business}&location=${searchInputs.where}&limit=${LIMIT}`,
  );
  const PATH = "/businesses/search";

  const [itemInfoChildren, setItemInfoChildren] = useState<ItemInfoChildrenType>({
    selectedBusiness: { id: DEFAULT_STRING, name: DEFAULT_STRING },
    reviewData: { total: DEFAULT_NUMBER },
  });

  useEffect(
    () => setTerm(`?term=${searchInputs.business}&location=${searchInputs.where}&limit=${LIMIT}`),
    [searchInputs],
  );

  useEffect(() => {
    if (term !== `?term=${DEFAULT_VALUE}&location=${DEFAULT_VALUE}&limit=${LIMIT}`)
      Promise.resolve(useFetchYELP(`${PATH}${term}`))
        .then((resp) => setResultYELP(resp))
        .catch((err) => console.error(err));
  }, [term]);

  useEffect(() => {
    console.log(idSelected);
    console.log(idSelected !== undefined);
    if (idSelected !== undefined)
      Promise.resolve(useFetchYELP(`/businesses/${idSelected}`))
        .then((resp) => {
          console.log("SelectBus");
          setSelectedBusiness(resp);
        })
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

  const updateSearchInputs = (objectIn: InputType) => {
    setSearchInputs({ ...searchInputs, business: objectIn.business, where: objectIn.where });
    if (!searchInputs.where) {
      (document.getElementById("where") as HTMLInputElement).placeholder =
        "Please, fill location field.";
    } else {
      (document.getElementById("where") as HTMLInputElement).placeholder = "Where...";
    }
  };

  console.log("resultYELP");
  console.log(resultYELP);
  console.log(selectedBusiness);

  return (
    <div className="App">
      <Switch>
        <Route exact path="/">
          <div>
            <Header updateSearchInputs={updateSearchInputs} />
            <div id="result-container">
              <ItemContainer setIdSelected={setIdSelected}>{resultYELP}</ItemContainer>
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
