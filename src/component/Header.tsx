import React, { ChangeEvent, useState, useEffect } from "react";
import { useDebounce } from "use-debounce/lib";
import { InputType } from "../interface";
import { Link } from "react-router-dom";
import { FilterInputType } from "../interface";

type updateSearchInputsType = {
  filterVal: FilterInputType;
  password: string | null;
  updateSearchInputs: (objectIn: InputType) => void;
  setFilterValue: (value: FilterInputType) => void;
  logOut: () => void;
};

type priceStrType = {
  base: string;
  prc1: number | string;
  prc2: number | string;
  prc3: number | string;
  prc4: number | string;
};

type attrStrType = {
  base: string;
  hotNew: string;
  requestQuote: string;
  reservation: string;
  deals: string;
  genderNeutral: string;
  openAll: string;
  wheelchair: string;
  endBase: string;
};

/**
 * transform object values in string
 * @param objectInput Input values Object
 * @returns parameter filter string
 */
const getParameterFilterStr = (objectInput: priceStrType | attrStrType): string => {
  const PriceArr = Object.values(objectInput);
  let htmlStr = ``;

  PriceArr.forEach((item: number | string, index: number) => {
    if (index === 0 || item === `"`) {
      htmlStr += `${item}`;
    } else {
      if (item !== "") htmlStr += `,${item}`;
    }
  });

  htmlStr = htmlStr.replace(/&price=,/g, "&price=");
  htmlStr = htmlStr.replace(/&attributes=",/g, `&attributes="`);

  return htmlStr;
};

/**
 * calculate and return min or max limit date
 * @param min_max select min or max limit date
 * @param dayLimit day/s limit
 * @returns min or max limit date
 */
const getDateInputLimit = (min_max: string, dayLimit: number): string => {
  const dateArr: Date[] = [];
  const DAY_IN_MS = 1000 * 60 * 60 * 24;
  if (min_max === "min") {
    dateArr.push(new Date(Date.now() - DAY_IN_MS * dayLimit));
  } else if (min_max === "max") {
    dateArr.push(new Date(Date.now() + DAY_IN_MS * dayLimit));
  }

  const MIN_DAY_INPUT = `0${dateArr[0].getDate()}`.slice(-2);
  const MIN_MONTH_INPUT = `0${dateArr[0].getMonth() + 1}`.slice(-2);

  return `0${dateArr[0].getFullYear()}-${MIN_MONTH_INPUT}-${MIN_DAY_INPUT}`;
};

export function Header(props: updateSearchInputsType): JSX.Element {
  const { updateSearchInputs, setFilterValue, logOut } = props;

  const DEFAULT_VALUE = null;
  const [businessInput, setBusinessInput] = useState<string>("");
  const [whereInput, setWhereInput] = useState<string>("");
  const [geolocationInput, setGeolocationInput] = useState<string>("");
  const [business] = useDebounce(businessInput, 500);
  const [where] = useDebounce(whereInput, 500);
  const [currentGeolocation] = useDebounce(geolocationInput, 500);
  const [searchValues, setSearchValues] = useState<InputType>({
    business: DEFAULT_VALUE,
    where: DEFAULT_VALUE,
  });
  const [openInput, setOpenInput] = useState<string>("DEFAULT");
  const [openAtHour, setopenAtHour] = useState<string>("00:00");
  // open_at YELP API attribute only supports 2 days after or before the current day
  const LIMIT_DAY = 2;

  const MIN_DATE_INPUT = getDateInputLimit("min", LIMIT_DAY);
  const MAX_DATE_INPUT = getDateInputLimit("max", LIMIT_DAY);

  const [openAtDate, setOpenAtDate] = useState<string>(
    `${new Date().getFullYear()}/${new Date().getMonth() + 1}/${new Date().getDate()}`,
  );

  const [price1, setPrice1] = useState<boolean>(false);
  const [price2, setPrice2] = useState<boolean>(false);
  const [price3, setPrice3] = useState<boolean>(false);
  const [price4, setPrice4] = useState<boolean>(false);
  const [priceStr, setPriceStr] = useState<priceStrType>({
    base: `&price=`,
    prc1: "",
    prc2: "",
    prc3: "",
    prc4: "",
  });

  const [hotNew, setHotNew] = useState<boolean>(false);
  const [requestQuote, setRequestQuote] = useState<boolean>(false);
  const [reservation, setReservation] = useState<boolean>(false);
  const [deals, setDeals] = useState<boolean>(false);
  const [genderNeutral, setGenderNeutral] = useState<boolean>(false);
  const [openAll, setOpenAll] = useState<boolean>(false);
  const [wheelchair, setWheelchair] = useState<boolean>(false);

  const [sortByInput, setSortByInput] = useState<string>(``);
  const [attributesInput, setAttributesInput] = useState<attrStrType>({
    base: `&attributes="`,
    hotNew: "",
    requestQuote: "",
    reservation: "",
    deals: "",
    genderNeutral: "",
    openAll: "",
    wheelchair: "",
    endBase: `"`,
  });

  /**
   * request current location and set latitud and longitud in where value
   */
  const getCurrentLocation = () => {
    setWhereInput("");
    setSearchValues({ ...searchValues, where: DEFAULT_VALUE });
    navigator.geolocation.getCurrentPosition(
      function (position) {
        setGeolocationInput(
          `&latitude=${position.coords.latitude}&longitude=${position.coords.longitude}`,
        );
      },
      function (error) {
        console.error(error);
      },
      {
        enableHighAccuracy: true,
      },
    );
  };

  useEffect(
    () => (price1 ? setPriceStr({ ...priceStr, prc1: 1 }) : setPriceStr({ ...priceStr, prc1: "" })),
    [price1],
  );

  useEffect(
    () => (price2 ? setPriceStr({ ...priceStr, prc2: 2 }) : setPriceStr({ ...priceStr, prc2: "" })),
    [price2],
  );

  useEffect(
    () => (price3 ? setPriceStr({ ...priceStr, prc3: 3 }) : setPriceStr({ ...priceStr, prc3: "" })),
    [price3],
  );

  useEffect(
    () => (price4 ? setPriceStr({ ...priceStr, prc4: 4 }) : setPriceStr({ ...priceStr, prc4: "" })),
    [price4],
  );

  useEffect(
    () =>
      price1 || price2 || price3 || price4
        ? setFilterValue({
            ...props.filterVal,
            priceFilter: getParameterFilterStr(priceStr),
          })
        : setFilterValue({
            ...props.filterVal,
            priceFilter: ``,
          }),
    [priceStr],
  );

  useEffect(
    () =>
      hotNew
        ? setAttributesInput({ ...attributesInput, hotNew: "hot_and_new" })
        : setAttributesInput({ ...attributesInput, hotNew: "" }),
    [hotNew],
  );

  useEffect(
    () =>
      requestQuote
        ? setAttributesInput({ ...attributesInput, requestQuote: "request_a_quote" })
        : setAttributesInput({ ...attributesInput, requestQuote: "" }),
    [requestQuote],
  );

  useEffect(
    () =>
      reservation
        ? setAttributesInput({ ...attributesInput, reservation: "reservation" })
        : setAttributesInput({ ...attributesInput, reservation: "" }),
    [reservation],
  );

  useEffect(
    () =>
      deals
        ? setAttributesInput({ ...attributesInput, deals: "deals" })
        : setAttributesInput({ ...attributesInput, deals: "" }),
    [deals],
  );

  useEffect(
    () =>
      genderNeutral
        ? setAttributesInput({ ...attributesInput, genderNeutral: "gender_neutral_restrooms" })
        : setAttributesInput({ ...attributesInput, genderNeutral: "" }),
    [genderNeutral],
  );

  useEffect(
    () =>
      openAll
        ? setAttributesInput({ ...attributesInput, openAll: "open_to_all" })
        : setAttributesInput({ ...attributesInput, openAll: "" }),
    [openAll],
  );

  useEffect(
    () =>
      wheelchair
        ? setAttributesInput({ ...attributesInput, wheelchair: "wheelchair_accessible" })
        : setAttributesInput({ ...attributesInput, wheelchair: "" }),
    [wheelchair],
  );

  useEffect(
    () =>
      hotNew || requestQuote || reservation || deals || genderNeutral || openAll || wheelchair
        ? setFilterValue({
            ...props.filterVal,
            attrFilter: getParameterFilterStr(attributesInput),
          })
        : setFilterValue({
            ...props.filterVal,
            attrFilter: ``,
          }),
    [attributesInput],
  );

  useEffect(() => setSearchValues({ ...searchValues, business: business }), [business]);

  useEffect(
    () =>
      !where && !currentGeolocation
        ? setSearchValues({ ...searchValues, where: DEFAULT_VALUE })
        : setSearchValues({ ...searchValues, where: `&location=${where}` }),
    [where],
  );

  useEffect(
    () =>
      !where && !currentGeolocation
        ? setSearchValues({ ...searchValues, where: DEFAULT_VALUE })
        : setSearchValues({ ...searchValues, where: currentGeolocation }),

    [currentGeolocation],
  );

  useEffect(
    () =>
      openInput === "DEFAULT"
        ? setFilterValue({ ...props.filterVal, openFilter: `` })
        : setFilterValue({ ...props.filterVal, openFilter: `&open_now=true` }),
    [openInput],
  );

  useEffect(
    () =>
      setFilterValue({
        ...props.filterVal,
        openFilter: `&open_at=${new Date(`${openAtDate} ${openAtHour}:00`).getTime() / 1000}`,
      }),
    [openAtDate, openAtHour],
  );

  useEffect(() => {
    if (sortByInput !== "")
      setFilterValue({ ...props.filterVal, sortByFilter: `&sort_by=${sortByInput}` });
  }, [sortByInput]);

  useEffect(() => {
    if (searchValues.where !== DEFAULT_VALUE) updateSearchInputs(searchValues);
  }, [searchValues]);

  return (
    <div
      id="header-container"
      style={{
        backgroundImage: `url("https://source.unsplash.com/1600x900/?food")`,
      }}
    >
      <div id="search-container">
        <Link to="/" id="title">
          <h1>Business Finder</h1>
        </Link>
        {props.password === "" ? (
          <div>
            <Link to="/login" id="login">
              <h3>{`Log In`}</h3>
            </Link>
            <Link to="/register" id="register">
              <h3>{`Register`}</h3>
            </Link>
          </div>
        ) : (
          <Link to="/" id="register" onClick={logOut}>
            <h3>{`Log Out`}</h3>
          </Link>
        )}

        <div id="input-container">
          <input
            type="text"
            id="business"
            name="business"
            placeholder="Search business..."
            value={businessInput}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setBusinessInput(e.target.value.toLowerCase())
            }
          />
          <div id="where-container">
            <input
              type="text"
              id="where"
              name="where"
              placeholder="Where..."
              value={whereInput}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setWhereInput(e.target.value.toLowerCase())
              }
            />
            <button id="gps-btn" title="Use my Location" onClick={getCurrentLocation}>
              <img id="gps-img" src="/img/gps.png" />
            </button>
          </div>
        </div>
        <button onClick={() => updateSearchInputs(searchValues)}>Search</button>
      </div>
      <div id="filter-container">
        <select
          id="select-open"
          defaultValue={"DEFAULT"}
          name="open"
          onChange={(e: ChangeEvent<HTMLSelectElement>) => setOpenInput(e.target.value)}
        >
          <option value="DEFAULT">Choose open option</option>
          <option value="openNow">Open Now</option>
          <option value="openAt">Open At</option>
        </select>
      </div>
      {openInput === "openAt" ? (
        <div id="openAt-container">
          <input
            type="time"
            id="openAtHour"
            name="openAtHour"
            value={openAtHour}
            min="00:00"
            max="23:59"
            onChange={(e: ChangeEvent<HTMLInputElement>) => setopenAtHour(e.target.value)}
            required
          />
          <input
            type="date"
            id="opentAt-date"
            name="openAtDate"
            value={openAtDate}
            min={MIN_DATE_INPUT}
            max={MAX_DATE_INPUT}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setOpenAtDate(e.target.value)}
          />
        </div>
      ) : (
        DEFAULT_VALUE
      )}

      <div id="price-input-container">
        <input type="checkbox" id="price1" value="1" onChange={() => setPrice1(!price1)} />
        <label htmlFor="price1">€</label>
        <input type="checkbox" id="price2" value="2" onChange={() => setPrice2(!price2)} />
        <label htmlFor="price2">€€</label>
        <input type="checkbox" id="price3" value="3" onChange={() => setPrice3(!price3)} />
        <label htmlFor="price3">€€€</label>
        <input type="checkbox" id="price4" value="4" onChange={() => setPrice4(!price4)} />
        <label htmlFor="price4">€€€€</label>
      </div>
      <select
        id="select-sortBy"
        defaultValue={""}
        name="sortBy"
        onChange={(e: ChangeEvent<HTMLSelectElement>) => setSortByInput(e.target.value)}
      >
        <option value="">Sort By</option>
        <option value="rating">Rating</option>
        <option value="review_count">Review count</option>
        <option value="distance">distance</option>
      </select>
      <div id="attributes-input-container">
        <input
          type="checkbox"
          id="hot_and_new"
          value="hot_and_new"
          onChange={() => setHotNew(!hotNew)}
        />
        <label htmlFor="hot_and_new">{`Hot&New`}</label>
        <input type="checkbox" id="deals" value="deals" onChange={() => setDeals(!deals)} />
        <label htmlFor="deals">Deals</label>
        <input
          type="checkbox"
          id="wheelchair_accessible"
          value="wheelchair_accessible"
          onChange={() => setWheelchair(!wheelchair)}
        />
        <label htmlFor="wheelchair_accessible">Wheelchair</label>
        <div id="att-in-big-screen">
          <input
            type="checkbox"
            id="request_a_quote"
            value="request_a_quote"
            onChange={() => setRequestQuote(!requestQuote)}
          />
          <label htmlFor="request_a_quote">Quote</label>
          <input
            type="checkbox"
            id="reservation"
            value="reservation"
            onChange={() => setReservation(!reservation)}
          />
          <label htmlFor="reservation">Reservation</label>

          <input
            type="checkbox"
            id="gender_neutral_restrooms"
            value="gender_neutral_restrooms"
            onChange={() => setGenderNeutral(!genderNeutral)}
          />
          <label htmlFor="gender_neutral_restrooms">Gender Neutral</label>
          <input
            type="checkbox"
            id="open_to_all"
            value="open_to_all"
            onChange={() => setOpenAll(!openAll)}
          />
          <label htmlFor="open_to_all">open to all</label>
        </div>
      </div>
    </div>
  );
}
