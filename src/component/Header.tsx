import React, { ChangeEvent, useState, useEffect, useContext } from "react";
import { useDebounce } from "use-debounce";
import { InputType } from "../interface";
import { Link } from "react-router-dom";
import { FilterInputType } from "../interface";
import { UserContext } from "../context/UserContext";
import { where } from "firebase/firestore";

type Props = {
  filterVal: FilterInputType;
  searchInputs: InputType;
  setSearchInputs: (objectIn: InputType) => void;
  setFilterValue: (value: FilterInputType) => void;
  isErrorLocation: boolean;
  isErrorBusiness: boolean;
  setIsErrorLocation: (typo: boolean) => void;
  setIsErrorBusiness: (typo: boolean) => void;
};

type SearchProps = {
  whereInput: string;
  businessInput: string;
  setBusinessInput: (value: string) => void;
  whereInPlaceholder: string;
  businessInPlaceholder: string;
  setWhereInput: (value: string) => void;
  getCurrentLocation: () => void;
  setIsErrorLocation: (typo: boolean) => void;
  setIsErrorBusiness: (typo: boolean) => void;
  setSearchInputs: (objectIn: InputType) => void;
  searchInputs: InputType;
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
  UNIT: 1,
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
  const MIN_MONTH_INPUT = `0${dateArr[0].getMonth() + DEFAULT_VALUES.UNIT}`.slice(-2);

  return `0${dateArr[0].getFullYear()}-${MIN_MONTH_INPUT}-${MIN_DAY_INPUT}`;
};

const SearchEle = (props: SearchProps): JSX.Element => {
  const {
    whereInput,
    businessInput,
    setBusinessInput,
    whereInPlaceholder,
    businessInPlaceholder,
    setWhereInput,
    getCurrentLocation,
    setIsErrorLocation,
    setIsErrorBusiness,
    setSearchInputs,
    searchInputs,
  } = props;

  return (
    <div className="flex flex-col items-center  text-black m-3">
      <input
        type="text"
        name="business"
        id="business"
        placeholder={businessInPlaceholder}
        value={businessInput}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setBusinessInput(e.target.value.toLowerCase())
        }
        className="w-[224px]"
      />
      <div className="mt-3">
        <input
          type="text"
          id="where"
          className="w-[200px]"
          name="where"
          placeholder={whereInPlaceholder}
          value={whereInput}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setWhereInput(e.target.value.toLowerCase())
          }
        />

        <button id="gps-btn" title="Use my Location" onClick={getCurrentLocation}>
          <img src="/img/gps.png" className="relative top-1 h-5 ml-1 " />
        </button>
      </div>

      <button
        className="text-white border border-solid border-white p-2 mt-3 hover:bg-gray-400"
        onClick={() => {
          if (
            whereInput !== DEFAULT_VALUES.EMPTY_STRING &&
            businessInput !== DEFAULT_VALUES.EMPTY_STRING
          )
            setSearchInputs({
              ...searchInputs,
              where: `&location=${whereInput}`,
              business: businessInput,
            });

          if (whereInput === DEFAULT_VALUES.EMPTY_STRING) setIsErrorLocation(true);
          if (businessInput === DEFAULT_VALUES.EMPTY_STRING) setIsErrorBusiness(true);
        }}
      >
        Search
      </button>
    </div>
  );
};

export function Header(props: Props): JSX.Element {
  const { setSearchInputs, setFilterValue, setIsErrorLocation, setIsErrorBusiness } = props;

  const { currentUsersId, logOut } = useContext(UserContext);

  const [businessInput, setBusinessInput] = useState<string>(DEFAULT_VALUES.EMPTY_STRING);
  const [whereInput, setWhereInput] = useState<string>(DEFAULT_VALUES.EMPTY_STRING);
  const [geolocationInput, setGeolocationInput] = useState<string>(DEFAULT_VALUES.EMPTY_STRING);
  const [currentGeolocation] = useDebounce(geolocationInput, 500);
  const [filterSide, setFilterSide] = useState<boolean>(false);

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
    `${new Date().getFullYear()}/${
      new Date().getMonth() + DEFAULT_VALUES.UNIT
    }/${new Date().getDate()}`,
  );

  const PRICE_OPTIONS_STR = {
    base: "&price=",
    prc1: DEFAULT_VALUES.UNIT,
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

  const LABEL_TITLE = {
    hotNew: "Popular businesses which recently joined Yelp",
    deals: "Businesses offering Yelp Deals on their profile page",
    wheelchair: "Businesses which are Wheelchair Accessible",
    requestQuote: "Businesses which actively reply to Request a Quote inquiries",
    reservation: "Businesses with Yelp Reservations bookings enabled on their profile page",
    genderNeutral: "Businesses which provide gender neutral restrooms",
    openAll: "Businesses which are Open To All",
  };

  const PLACE_HOLDER = {
    where_default: "Where...",
    business_default: "Search business..",
    business_error: "Please, fill business type",
    where_error: "Please, fill a correct location",
  };

  const [whereInPlaceholder, setWhereInPlaceholder] = useState<string>(PLACE_HOLDER.where_default);
  const [businessInPlaceholder, setbusinessInPlaceholder] = useState<string>(
    PLACE_HOLDER.business_default,
  );
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

  useEffect(
    () =>
      !whereInput && !currentGeolocation
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
      console.log("IS ERROR LOCATION");
      setWhereInput(DEFAULT_VALUES.EMPTY_STRING);
      setWhereInPlaceholder(PLACE_HOLDER.where_error);
    } else {
      setSearchInputs(props.searchInputs);
      setWhereInPlaceholder(PLACE_HOLDER.where_default);
    }
  }, [props.isErrorLocation]);

  useEffect(() => {
    if (props.isErrorBusiness) {
      console.log("IS ERROR BUSINESS");
      setBusinessInput(DEFAULT_VALUES.EMPTY_STRING);
      setbusinessInPlaceholder(PLACE_HOLDER.business_error);
    } else {
      setSearchInputs(props.searchInputs);
      setbusinessInPlaceholder(PLACE_HOLDER.business_default);
    }
  }, [props.isErrorBusiness]);

  const UserContainer = (): JSX.Element => {
    return (
      <div className="m-3">
        {currentUsersId.password === DEFAULT_VALUES.EMPTY_STRING ? (
          <div>
            <Link to="/login">
              <img className="h-5 mr-1" src="/img/nullUser.png" alt="avatar image" />
            </Link>
          </div>
        ) : (
          <Link to="/profile" id="profile">
            <img
              className="h-5 mr-1"
              src={
                currentUsersId.avatar !== DEFAULT_VALUES.EMPTY_STRING
                  ? currentUsersId.avatar
                  : "/img/nullUser.png"
              }
              alt="avatar image"
            />
            {currentUsersId.username}
          </Link>
        )}
        {currentUsersId.password === DEFAULT_VALUES.EMPTY_STRING ? (
          <div>
            <Link to="/login" className="hidden sm:block">
              <h3>{`Log In`}</h3>
            </Link>
            <Link to="/register" className="hidden">
              <h3>{`Register`}</h3>
            </Link>
          </div>
        ) : (
          <Link to="/" onClick={logOut}>
            <h3>{`Log Out`}</h3>
          </Link>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-between bg-gray-500 text-white p-4">
        <div className="w-full">
          <div className="flex flex-wrap justify-between">
            <Link to="/" className="self-center m-3">
              <h1>Business Finder</h1>
            </Link>
            <div className="hidden sm:block">
              <SearchEle
                whereInput={whereInput}
                businessInput={businessInput}
                setBusinessInput={setBusinessInput}
                businessInPlaceholder={businessInPlaceholder}
                whereInPlaceholder={whereInPlaceholder}
                setWhereInput={setWhereInput}
                getCurrentLocation={getCurrentLocation}
                setIsErrorLocation={setIsErrorLocation}
                setIsErrorBusiness={setIsErrorBusiness}
                setSearchInputs={setSearchInputs}
                searchInputs={props.searchInputs}
              />
            </div>

            <div className="block sm:hidden">
              <UserContainer />
            </div>
            <div className="hidden sm:block sm:self-center">
              <UserContainer />
            </div>
          </div>
          <div className="sm:hidden">
            <SearchEle
              whereInput={whereInput}
              businessInput={businessInput}
              setBusinessInput={setBusinessInput}
              businessInPlaceholder={businessInPlaceholder}
              whereInPlaceholder={whereInPlaceholder}
              setWhereInput={setWhereInput}
              getCurrentLocation={getCurrentLocation}
              setIsErrorLocation={setIsErrorLocation}
              setIsErrorBusiness={setIsErrorBusiness}
              setSearchInputs={setSearchInputs}
              searchInputs={props.searchInputs}
            />
          </div>
        </div>
      </div>
      <button
        className=" bg-gray-500 text-white border border-solid border-white p-2 m-3 hover:bg-gray-400"
        onClick={() => setFilterSide(!filterSide)}
      >
        {filterSide ? `Hide filters` : `See all filters`}
      </button>
      <div
        className={
          filterSide
            ? ` text-gray-500 mt-2  p-4  bg-slate-400 border-b border-solid border-cyan-500`
            : `hidden`
        }
      >
        <div className="mb-2 ">
          <select
            className="pr-12  border-0 border-b-2 bg-transparent border-gray-500 "
            id="select-open"
            defaultValue={DEFAULT_VALUES.INPUT_SELECT}
            name="open"
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setOpenInput(e.target.value)}
          >
            <option value={OPEN_SELECT.DEFAULT}> Select opening hours</option>
            <option value={OPEN_SELECT.OPEN_NOW}>Open Now</option>
            <option value={OPEN_SELECT.OPEN_AT}>Open At</option>
          </select>
        </div>
        {openInput === OPEN_SELECT.OPEN_AT && (
          <div id="openAt-container" className="text-gray-500 mb-2">
            <input
              type="time"
              id="openAtHour"
              className="text-gray-500  bg-transparent "
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
              className="text-gray-500  bg-transparent "
              name="openAtDate"
              value={openAtDate}
              min={MIN_DATE_INPUT}
              max={MAX_DATE_INPUT}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setOpenAtDate(e.target.value)}
            />
          </div>
        )}

        <div id="price-input-container" className="m-2">
          <input
            type="checkbox"
            id="price1"
            className="mr-2"
            value={PRICE_OPTIONS_STR.prc1}
            onChange={() =>
              setpriceIn({
                ...priceIn,
                prc1: { ...priceIn.prc1, isChecked: !priceIn.prc1.isChecked },
              })
            }
          />
          <label htmlFor="price1" className="mr-2">
            €
          </label>
          <input
            type="checkbox"
            id="price2"
            className="mr-2"
            value={PRICE_OPTIONS_STR.prc2}
            onChange={() =>
              setpriceIn({
                ...priceIn,
                prc2: { ...priceIn.prc2, isChecked: !priceIn.prc2.isChecked },
              })
            }
          />
          <label htmlFor="price2" className="mr-2">
            €€
          </label>
          <input
            type="checkbox"
            id="price3"
            className="mr-2"
            value={PRICE_OPTIONS_STR.prc3}
            onChange={() =>
              setpriceIn({
                ...priceIn,
                prc3: { ...priceIn.prc3, isChecked: !priceIn.prc3.isChecked },
              })
            }
          />
          <label htmlFor="price3" className="mr-2">
            €€€
          </label>
          <input
            type="checkbox"
            id="price4"
            className="mr-2"
            value={PRICE_OPTIONS_STR.prc4}
            onChange={() =>
              setpriceIn({
                ...priceIn,
                prc4: { ...priceIn.prc4, isChecked: !priceIn.prc4.isChecked },
              })
            }
          />
          <label htmlFor="price4" className="mr-2">
            €€€€
          </label>
        </div>
        <select
          id="select-sortBy"
          className="mb-2 border-0 border-b-2 bg-transparent border-gray-500"
          defaultValue={SORT_BY_SELECT.DEFAULT}
          name="sortBy"
          onChange={(e: ChangeEvent<HTMLSelectElement>) => setSortByInput(e.target.value)}
        >
          <option value={SORT_BY_SELECT.DEFAULT}>Sort By</option>
          <option value={SORT_BY_SELECT.RATING}>Rating</option>
          <option value={SORT_BY_SELECT.REVIEW_COUNT}>Review count</option>
          <option value={SORT_BY_SELECT.DISTANCE}>Distance</option>
        </select>
        <div id="attributes-input-container" className="flex flex-col items-start m-2">
          <div>
            <input
              type="checkbox"
              id={FILTER_VALUES_TRUE.hotNew}
              className="mr-2"
              value={FILTER_VALUES_TRUE.hotNew}
              onChange={() =>
                setAttributesIn({
                  ...attributesIn,
                  hotNew: { ...attributesIn.hotNew, isChecked: !attributesIn.hotNew.isChecked },
                })
              }
            />
            <label
              title={LABEL_TITLE.hotNew}
              htmlFor={FILTER_VALUES_TRUE.hotNew}
              className="mr-2"
            >{`Hot&New`}</label>
          </div>
          <div>
            <input
              type="checkbox"
              id={FILTER_VALUES_TRUE.deals}
              className="mr-2"
              value={FILTER_VALUES_TRUE.deals}
              onChange={() =>
                setAttributesIn({
                  ...attributesIn,
                  deals: { ...attributesIn.deals, isChecked: !attributesIn.deals.isChecked },
                })
              }
            />
            <label title={LABEL_TITLE.deals} htmlFor={FILTER_VALUES_TRUE.deals} className="mr-2">
              Deals
            </label>
          </div>
          <div>
            <input
              type="checkbox"
              id={FILTER_VALUES_TRUE.requestQuote}
              className="mr-2"
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
            <label
              title={LABEL_TITLE.requestQuote}
              htmlFor={FILTER_VALUES_TRUE.requestQuote}
              className="mr-2"
            >
              Quote
            </label>
          </div>
          <div>
            <input
              type="checkbox"
              id={FILTER_VALUES_TRUE.reservation}
              className="mr-2"
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
            <label
              title={LABEL_TITLE.reservation}
              htmlFor={FILTER_VALUES_TRUE.reservation}
              className="mr-2"
            >
              Reservation
            </label>
          </div>
          <div>
            <input
              type="checkbox"
              id={FILTER_VALUES_TRUE.genderNeutral}
              className="mr-2"
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
            <label
              title={LABEL_TITLE.genderNeutral}
              htmlFor={FILTER_VALUES_TRUE.genderNeutral}
              className="mr-2"
            >
              Gender Neutral
            </label>
          </div>
          <div>
            <input
              type="checkbox"
              id={FILTER_VALUES_TRUE.openAll}
              className="mr-2"
              value={FILTER_VALUES_TRUE.openAll}
              onChange={() =>
                setAttributesIn({
                  ...attributesIn,
                  openAll: { ...attributesIn.openAll, isChecked: !attributesIn.openAll.isChecked },
                })
              }
            />
            <label
              title={LABEL_TITLE.openAll}
              htmlFor={FILTER_VALUES_TRUE.openAll}
              className="mr-2"
            >
              Open to all
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
