import React, { ChangeEvent, useState, useEffect, useContext } from "react";
import { useDebounce } from "use-debounce/lib";
import { InputType } from "../interface";
import { Link } from "react-router-dom";
import { FilterInputType } from "../interface";
import { UserContext } from "../context/UserContext";

type Props = {
  filterVal: FilterInputType;
  searchInputs: InputType;
  setSearchInputs: (objectIn: InputType) => void;
  setFilterValue: (value: FilterInputType) => void;
  isErrorLocation: boolean;
  setIsErrorLocation: (typo: boolean) => void;
};

type attrType = {
  base: string;
  hotNew: attrFilterInType;
  requestQuote: attrFilterInType;
  reservation: attrFilterInType;
  deals: attrFilterInType;
  genderNeutral: attrFilterInType;
  openAll: attrFilterInType;
  wheelchair: attrFilterInType;
  endBase: string;
};

type priceType = {
  base: string;
  prc1: attrFilterInType;
  prc2: attrFilterInType;
  prc3: attrFilterInType;
  prc4: attrFilterInType;
};

type attrFilterInType = {
  isChecked: boolean;
  str: number | string;
};

const DEFAULT_VALUES = {
  NULL: null,
  INPUT_SELECT: "DEFAULT",
  EMPTY_STRING: "",
};

/**
 * transform object values in string
 * @param objectInput Input values Object
 * @returns parameter filter string
 */
const getParameterFilterStr = (objectInput: attrType | priceType): string => {
  const valArr = Object.values(objectInput);
  let htmlStr = DEFAULT_VALUES.EMPTY_STRING;

  valArr.forEach((item: attrFilterInType | string, index: number) => {
    if (index === 0 || item === `"`) {
      htmlStr += `${item}`;
    } else {
      if (typeof item !== "string" && item.str !== DEFAULT_VALUES.EMPTY_STRING)
        htmlStr += `,${item.str}`;
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

export function Header(props: Props): JSX.Element {
  const { setSearchInputs, setFilterValue, setIsErrorLocation } = props;

  const { currentUsersId, logOut } = useContext(UserContext);

  const [businessInput, setBusinessInput] = useState<string>(DEFAULT_VALUES.EMPTY_STRING);
  const [whereInput, setWhereInput] = useState<string>(DEFAULT_VALUES.EMPTY_STRING);
  const [geolocationInput, setGeolocationInput] = useState<string>(DEFAULT_VALUES.EMPTY_STRING);
  const [business] = useDebounce(businessInput, 500);
  const [where] = useDebounce(whereInput, 500);
  const [currentGeolocation] = useDebounce(geolocationInput, 500);

  const OPEN_SELECT = {
    DEFAULT: DEFAULT_VALUES.INPUT_SELECT,
    OPEN_AT: "OpenAt",
    OPEN_NOW: "OpenNow",
  };

  const SORT_BY_SELECT = {
    DEFAULT: DEFAULT_VALUES.INPUT_SELECT,
    RATING: "rating",
    REVIEW_COUNT: "review_count",
    DISTANCE: "distance",
  };

  const [openInput, setOpenInput] = useState<string>(DEFAULT_VALUES.INPUT_SELECT);
  const [openAtHour, setopenAtHour] = useState<string>("00:00");
  // open_at YELP API attribute only supports 2 days after or before the current day
  const LIMIT_DAY = 2;

  const MIN_DATE_INPUT = getDateInputLimit("min", LIMIT_DAY);
  const MAX_DATE_INPUT = getDateInputLimit("max", LIMIT_DAY);

  const [openAtDate, setOpenAtDate] = useState<string>(
    `${new Date().getFullYear()}/${new Date().getMonth() + 1}/${new Date().getDate()}`,
  );

  const PRICE_OPTIONS_STR = {
    base: "&price=",
    prc1: 1,
    prc2: 2,
    prc3: 3,
    prc4: 4,
  };

  const [priceIn, setpriceIn] = useState<priceType>({
    base: PRICE_OPTIONS_STR.base,
    prc1: { isChecked: false, str: DEFAULT_VALUES.EMPTY_STRING },
    prc2: { isChecked: false, str: DEFAULT_VALUES.EMPTY_STRING },
    prc3: { isChecked: false, str: DEFAULT_VALUES.EMPTY_STRING },
    prc4: { isChecked: false, str: DEFAULT_VALUES.EMPTY_STRING },
  });

  const [sortByInput, setSortByInput] = useState<string>(DEFAULT_VALUES.EMPTY_STRING);

  const FILTER_VALUES_TRUE = {
    hotNew: "hot_and_new",
    deals: "deals",
    wheelchair: "wheelchair_accessible",
    requestQuote: "request_a_quote",
    reservation: "reservation",
    genderNeutral: "gender_neutral_restrooms",
    openAll: "open_to_all",
  };

  const [attributesIn, setAttributesIn] = useState<attrType>({
    base: `&attributes="`,
    hotNew: { isChecked: false, str: DEFAULT_VALUES.EMPTY_STRING },
    deals: { isChecked: false, str: DEFAULT_VALUES.EMPTY_STRING },
    wheelchair: { isChecked: false, str: DEFAULT_VALUES.EMPTY_STRING },
    requestQuote: { isChecked: false, str: DEFAULT_VALUES.EMPTY_STRING },
    reservation: { isChecked: false, str: DEFAULT_VALUES.EMPTY_STRING },
    genderNeutral: { isChecked: false, str: DEFAULT_VALUES.EMPTY_STRING },
    openAll: { isChecked: false, str: DEFAULT_VALUES.EMPTY_STRING },
    endBase: `"`,
  });

  const [whereInPlaceholder, setWhereInPlaceholder] = useState<string>("Where...");

  const LABEL_TITLE = {
    hotNew: "Popular businesses which recently joined Yelp",
    deals: "Businesses offering Yelp Deals on their profile page",
    wheelchair: "Businesses which are Wheelchair Accessible",
    requestQuote: "Businesses which actively reply to Request a Quote inquiries",
    reservation: "Businesses with Yelp Reservations bookings enabled on their profile page",
    genderNeutral: "Businesses which provide gender neutral restrooms",
    openAll: "Businesses which are Open To All",
  };

  /**
   * get current location and set latitud and longitud in where value
   */
  const getCurrentLocation = () => {
    setWhereInput(DEFAULT_VALUES.EMPTY_STRING);
    setSearchInputs({ ...props.searchInputs, where: DEFAULT_VALUES.NULL });
    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
        setGeolocationInput(
          `&latitude=${position.coords.latitude}&longitude=${position.coords.longitude}`,
        );
      },
      (error: GeolocationPositionError) => {
        console.error(error);
      },
      {
        enableHighAccuracy: true,
      },
    );
  };

  useEffect(
    () =>
      priceIn.prc1.isChecked
        ? setpriceIn({
            ...priceIn,
            prc1: { ...priceIn.prc1, str: PRICE_OPTIONS_STR.prc1 },
          })
        : setpriceIn({
            ...priceIn,
            prc1: { ...priceIn.prc1, str: DEFAULT_VALUES.EMPTY_STRING },
          }),
    [priceIn.prc1.isChecked],
  );

  useEffect(
    () =>
      priceIn.prc2.isChecked
        ? setpriceIn({
            ...priceIn,
            prc2: { ...priceIn.prc2, str: PRICE_OPTIONS_STR.prc2 },
          })
        : setpriceIn({
            ...priceIn,
            prc2: { ...priceIn.prc2, str: DEFAULT_VALUES.EMPTY_STRING },
          }),
    [priceIn.prc2.isChecked],
  );

  useEffect(
    () =>
      priceIn.prc3.isChecked
        ? setpriceIn({
            ...priceIn,
            prc3: { ...priceIn.prc3, str: PRICE_OPTIONS_STR.prc3 },
          })
        : setpriceIn({
            ...priceIn,
            prc3: { ...priceIn.prc3, str: DEFAULT_VALUES.EMPTY_STRING },
          }),
    [priceIn.prc3.isChecked],
  );

  useEffect(
    () =>
      priceIn.prc4.isChecked
        ? setpriceIn({
            ...priceIn,
            prc4: { ...priceIn.prc4, str: PRICE_OPTIONS_STR.prc4 },
          })
        : setpriceIn({
            ...priceIn,
            prc4: { ...priceIn.prc4, str: DEFAULT_VALUES.EMPTY_STRING },
          }),
    [priceIn.prc4.isChecked],
  );

  useEffect(
    () =>
      priceIn.prc1.isChecked ||
      priceIn.prc2.isChecked ||
      priceIn.prc3.isChecked ||
      priceIn.prc4.isChecked
        ? setFilterValue({
            ...props.filterVal,
            priceFilter: getParameterFilterStr(priceIn),
          })
        : setFilterValue({
            ...props.filterVal,
            priceFilter: DEFAULT_VALUES.EMPTY_STRING,
          }),
    [priceIn],
  );

  useEffect(
    () =>
      attributesIn.hotNew.isChecked
        ? setAttributesIn({
            ...attributesIn,
            hotNew: { ...attributesIn.hotNew, str: FILTER_VALUES_TRUE.hotNew },
          })
        : setAttributesIn({
            ...attributesIn,
            hotNew: { ...attributesIn.hotNew, str: DEFAULT_VALUES.EMPTY_STRING },
          }),
    [attributesIn.hotNew.isChecked],
  );

  useEffect(
    () =>
      attributesIn.deals.isChecked
        ? setAttributesIn({
            ...attributesIn,
            deals: { ...attributesIn.deals, str: FILTER_VALUES_TRUE.deals },
          })
        : setAttributesIn({
            ...attributesIn,
            deals: { ...attributesIn.deals, str: DEFAULT_VALUES.EMPTY_STRING },
          }),
    [attributesIn.deals.isChecked],
  );

  useEffect(
    () =>
      attributesIn.wheelchair.isChecked
        ? setAttributesIn({
            ...attributesIn,
            wheelchair: { ...attributesIn.wheelchair, str: FILTER_VALUES_TRUE.wheelchair },
          })
        : setAttributesIn({
            ...attributesIn,
            wheelchair: { ...attributesIn.wheelchair, str: DEFAULT_VALUES.EMPTY_STRING },
          }),
    [attributesIn.wheelchair.isChecked],
  );

  useEffect(
    () =>
      attributesIn.requestQuote.isChecked
        ? setAttributesIn({
            ...attributesIn,
            requestQuote: { ...attributesIn.requestQuote, str: FILTER_VALUES_TRUE.requestQuote },
          })
        : setAttributesIn({
            ...attributesIn,
            requestQuote: { ...attributesIn.requestQuote, str: DEFAULT_VALUES.EMPTY_STRING },
          }),
    [attributesIn.requestQuote.isChecked],
  );

  useEffect(
    () =>
      attributesIn.reservation.isChecked
        ? setAttributesIn({
            ...attributesIn,
            reservation: { ...attributesIn.reservation, str: FILTER_VALUES_TRUE.reservation },
          })
        : setAttributesIn({
            ...attributesIn,
            reservation: { ...attributesIn.reservation, str: DEFAULT_VALUES.EMPTY_STRING },
          }),
    [attributesIn.reservation.isChecked],
  );

  useEffect(
    () =>
      attributesIn.genderNeutral.isChecked
        ? setAttributesIn({
            ...attributesIn,
            genderNeutral: { ...attributesIn.genderNeutral, str: FILTER_VALUES_TRUE.genderNeutral },
          })
        : setAttributesIn({
            ...attributesIn,
            genderNeutral: { ...attributesIn.genderNeutral, str: DEFAULT_VALUES.EMPTY_STRING },
          }),
    [attributesIn.genderNeutral.isChecked],
  );

  useEffect(
    () =>
      attributesIn.openAll.isChecked
        ? setAttributesIn({
            ...attributesIn,
            openAll: { ...attributesIn.openAll, str: FILTER_VALUES_TRUE.openAll },
          })
        : setAttributesIn({
            ...attributesIn,
            openAll: { ...attributesIn.openAll, str: DEFAULT_VALUES.EMPTY_STRING },
          }),
    [attributesIn.openAll.isChecked],
  );

  useEffect(
    () =>
      attributesIn.hotNew.isChecked ||
      attributesIn.deals.isChecked ||
      attributesIn.wheelchair.isChecked ||
      attributesIn.requestQuote.isChecked ||
      attributesIn.reservation.isChecked ||
      attributesIn.genderNeutral.isChecked ||
      attributesIn.openAll.isChecked
        ? setFilterValue({
            ...props.filterVal,
            attrFilter: getParameterFilterStr(attributesIn),
          })
        : setFilterValue({
            ...props.filterVal,
            attrFilter: DEFAULT_VALUES.EMPTY_STRING,
          }),
    [attributesIn],
  );

  useEffect(() => setSearchInputs({ ...props.searchInputs, business: business }), [business]);

  useEffect(
    () =>
      !where && !currentGeolocation
        ? setSearchInputs({ ...props.searchInputs, where: DEFAULT_VALUES.NULL })
        : setSearchInputs({ ...props.searchInputs, where: `&location=${where}` }),
    [where],
  );

  useEffect(
    () =>
      !where && !currentGeolocation
        ? setSearchInputs({ ...props.searchInputs, where: DEFAULT_VALUES.NULL })
        : setSearchInputs({ ...props.searchInputs, where: currentGeolocation }),

    [currentGeolocation],
  );

  useEffect(
    () =>
      openInput === DEFAULT_VALUES.INPUT_SELECT
        ? setFilterValue({ ...props.filterVal, openFilter: DEFAULT_VALUES.EMPTY_STRING })
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
    if (sortByInput !== DEFAULT_VALUES.EMPTY_STRING)
      setFilterValue({ ...props.filterVal, sortByFilter: `&sort_by=${sortByInput}` });
  }, [sortByInput]);

  useEffect(() => {
    if (props.searchInputs.where !== DEFAULT_VALUES.NULL) setIsErrorLocation(false);
    if (props.searchInputs.where === DEFAULT_VALUES.EMPTY_STRING) setIsErrorLocation(true);
  }, [props.searchInputs]);

  useEffect(() => {
    if (props.isErrorLocation) {
      setWhereInput(DEFAULT_VALUES.EMPTY_STRING);
      setWhereInPlaceholder("Please, fill a correct location");
    } else {
      setSearchInputs(props.searchInputs);
      setWhereInPlaceholder("Where...");
    }
  }, [props.isErrorLocation]);

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
        <Link to="/profile" id="profile">
          <img
            id="img-avatar"
            src={
              currentUsersId.avatar !== DEFAULT_VALUES.EMPTY_STRING
                ? currentUsersId.avatar
                : "/img/nullUser.png"
            }
            alt="avatar image"
          />
        </Link>

        {currentUsersId.password === DEFAULT_VALUES.EMPTY_STRING ? (
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
              className={props.isErrorLocation ? "error" : DEFAULT_VALUES.EMPTY_STRING}
              name="where"
              placeholder={whereInPlaceholder}
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
        <button
          onClick={() => {
            if (where === DEFAULT_VALUES.EMPTY_STRING) setIsErrorLocation(true);
          }}
        >
          Search
        </button>
      </div>
      <div id="filter-container">
        <select
          id="select-open"
          defaultValue={DEFAULT_VALUES.INPUT_SELECT}
          name="open"
          onChange={(e: ChangeEvent<HTMLSelectElement>) => setOpenInput(e.target.value)}
        >
          <option value={OPEN_SELECT.DEFAULT}>Choose open option</option>
          <option value={OPEN_SELECT.OPEN_NOW}>Open Now</option>
          <option value={OPEN_SELECT.OPEN_AT}>Open At</option>
        </select>
      </div>
      {openInput === OPEN_SELECT.OPEN_AT && (
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
      )}

      <div id="price-input-container">
        <input
          type="checkbox"
          id="price1"
          value={PRICE_OPTIONS_STR.prc1}
          onChange={() =>
            setpriceIn({
              ...priceIn,
              prc1: { ...priceIn.prc1, isChecked: !priceIn.prc1.isChecked },
            })
          }
        />
        <label htmlFor="price1">€</label>
        <input
          type="checkbox"
          id="price2"
          value={PRICE_OPTIONS_STR.prc2}
          onChange={() =>
            setpriceIn({
              ...priceIn,
              prc2: { ...priceIn.prc2, isChecked: !priceIn.prc2.isChecked },
            })
          }
        />
        <label htmlFor="price2">€€</label>
        <input
          type="checkbox"
          id="price3"
          value={PRICE_OPTIONS_STR.prc3}
          onChange={() =>
            setpriceIn({
              ...priceIn,
              prc3: { ...priceIn.prc3, isChecked: !priceIn.prc3.isChecked },
            })
          }
        />
        <label htmlFor="price3">€€€</label>
        <input
          type="checkbox"
          id="price4"
          value={PRICE_OPTIONS_STR.prc4}
          onChange={() =>
            setpriceIn({
              ...priceIn,
              prc4: { ...priceIn.prc4, isChecked: !priceIn.prc4.isChecked },
            })
          }
        />
        <label htmlFor="price4">€€€€</label>
      </div>
      <select
        id="select-sortBy"
        defaultValue={SORT_BY_SELECT.DEFAULT}
        name="sortBy"
        onChange={(e: ChangeEvent<HTMLSelectElement>) => setSortByInput(e.target.value)}
      >
        <option value={SORT_BY_SELECT.DEFAULT}>Sort By</option>
        <option value={SORT_BY_SELECT.RATING}>Rating</option>
        <option value={SORT_BY_SELECT.REVIEW_COUNT}>Review count</option>
        <option value={SORT_BY_SELECT.DISTANCE}>Distance</option>
      </select>
      <div id="attributes-input-container">
        <input
          type="checkbox"
          id={FILTER_VALUES_TRUE.hotNew}
          value={FILTER_VALUES_TRUE.hotNew}
          onChange={() =>
            setAttributesIn({
              ...attributesIn,
              hotNew: { ...attributesIn.hotNew, isChecked: !attributesIn.hotNew.isChecked },
            })
          }
        />
        <label title={LABEL_TITLE.hotNew} htmlFor={FILTER_VALUES_TRUE.hotNew}>{`Hot&New`}</label>
        <input
          type="checkbox"
          id={FILTER_VALUES_TRUE.deals}
          value={FILTER_VALUES_TRUE.deals}
          onChange={() =>
            setAttributesIn({
              ...attributesIn,
              deals: { ...attributesIn.deals, isChecked: !attributesIn.deals.isChecked },
            })
          }
        />
        <label title={LABEL_TITLE.deals} htmlFor={FILTER_VALUES_TRUE.deals}>
          Deals
        </label>
        <input
          type="checkbox"
          id={FILTER_VALUES_TRUE.wheelchair}
          value={FILTER_VALUES_TRUE.wheelchair}
          onChange={() =>
            setAttributesIn({
              ...attributesIn,
              wheelchair: {
                ...attributesIn.wheelchair,
                isChecked: !attributesIn.wheelchair.isChecked,
              },
            })
          }
        />
        <label title={LABEL_TITLE.wheelchair} htmlFor={FILTER_VALUES_TRUE.wheelchair}>
          Wheelchair
        </label>
        <div id="att-in-big-screen">
          <input
            type="checkbox"
            id={FILTER_VALUES_TRUE.requestQuote}
            value={FILTER_VALUES_TRUE.requestQuote}
            onChange={() =>
              setAttributesIn({
                ...attributesIn,
                requestQuote: {
                  ...attributesIn.requestQuote,
                  isChecked: !attributesIn.requestQuote.isChecked,
                },
              })
            }
          />
          <label title={LABEL_TITLE.requestQuote} htmlFor={FILTER_VALUES_TRUE.requestQuote}>
            Quote
          </label>
          <input
            type="checkbox"
            id={FILTER_VALUES_TRUE.reservation}
            value={FILTER_VALUES_TRUE.reservation}
            onChange={() =>
              setAttributesIn({
                ...attributesIn,
                reservation: {
                  ...attributesIn.reservation,
                  isChecked: !attributesIn.reservation.isChecked,
                },
              })
            }
          />
          <label title={LABEL_TITLE.reservation} htmlFor={FILTER_VALUES_TRUE.reservation}>
            Reservation
          </label>

          <input
            type="checkbox"
            id={FILTER_VALUES_TRUE.genderNeutral}
            value={FILTER_VALUES_TRUE.genderNeutral}
            onChange={() =>
              setAttributesIn({
                ...attributesIn,
                genderNeutral: {
                  ...attributesIn.genderNeutral,
                  isChecked: !attributesIn.genderNeutral.isChecked,
                },
              })
            }
          />
          <label title={LABEL_TITLE.genderNeutral} htmlFor={FILTER_VALUES_TRUE.genderNeutral}>
            Gender Neutral
          </label>
          <input
            type="checkbox"
            id={FILTER_VALUES_TRUE.openAll}
            value={FILTER_VALUES_TRUE.openAll}
            onChange={() =>
              setAttributesIn({
                ...attributesIn,
                openAll: { ...attributesIn.openAll, isChecked: !attributesIn.openAll.isChecked },
              })
            }
          />
          <label title={LABEL_TITLE.openAll} htmlFor={FILTER_VALUES_TRUE.openAll}>
            open to all
          </label>
        </div>
      </div>
    </div>
  );
}
