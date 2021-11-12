import React, { useEffect, useState } from "react";
import { OpenType, HoursType, categoriesType, reviewsType } from "../interface";
import { BasicInfoProd, ItemReview } from "./index";
import { Link } from "react-router-dom";

type Props = {
  id: string;
  name: string;
  rating?: number;
  review_count?: number;
  price?: string;
  categories?: categoriesType[];
  is_closed?: boolean;
  hours?: HoursType[];
  location_disp?: string[];
  url?: string | null;
  phone?: string | null;
  photosArr?: string[];
  revPos_lang?: string[];
  revArr?: reviewsType[];
  revTotal: number;
  setIdReviewData: (id: string) => void;
};

/**
 * Set url inside main image element
 * @param srcValue image url string
 */
export const setMainImg = (srcValue: string): void => {
  const mainImgEle = document.getElementById("main-img");
  if (mainImgEle) mainImgEle.setAttribute("src", srcValue);
};

/**
 * Get Week day
 * @param index number (week day)
 * @returns Week day string
 */
export const getDay = (index: number): string => {
  switch (index) {
    case 0:
      return "Monday";
    case 1:
      return "Tuesday";
    case 2:
      return "Wednesday";
    case 3:
      return "Thursday";
    case 4:
      return "Friday";
    case 5:
      return "Saturday";
    case 6:
      return "Sunday";
    default:
      return "";
  }
};

/**
 * set open hours element content
 * @param itemInfo open hours array
 * @returns Open hours JSX.Element array for full week
 */
export const getOpenHours = (itemInfo: HoursType[] | undefined) => {
  const openHoursArr: JSX.Element[] = [];
  if (itemInfo) {
    itemInfo[0].open.map((item: OpenType, index: number) => {
      openHoursArr.push(
        <p key={index}>{`${getDay(index)} ${item.start.substring(0, 2)}:${item.start.slice(
          2,
        )} - ${item.end.substring(0, 2)}:${item.end.slice(2)}`}</p>,
      );
    });
  }

  return openHoursArr;
};

/**
 * collect items inside display_address array
 * @param data display_address array
 * @returns p element with address inside display_address array
 */
export const getAddress = (data: string[]): JSX.Element => {
  let htmlText = "";
  if (data) {
    data.map((item: string, index: number) => {
      if (index !== 0) {
        htmlText += ` ${item}`;
      } else {
        htmlText += `${item}`;
      }
    });
  }

  return <p>{htmlText}</p>;
};

export const ItemInfo = (props: Props): JSX.Element => {
  const { setIdReviewData } = props;
  const [showReview, setShowReview] = useState<boolean>(false);

  const DEFAULT_VALUE = null;

  const [showOpenHours, setShowOpenHours] = useState<boolean>(false);
  const [showPhone, setShowPhone] = useState<boolean>(false);

  useEffect(() => {
    setShowOpenHours(false);
    setShowReview(false);
  }, [props.id]);

  return (
    <div id="item-info-container">
      <div id="info-container">
        <Link to="/" id="title">
          <h3>{`< Go Back `}</h3>
        </Link>
        <BasicInfoProd
          name={props?.name}
          rating={props?.rating}
          review_count={props?.review_count}
          price={props?.price}
          categories={props?.categories}
          is_closed={props?.is_closed}
        />
        {props?.hours ? (
          <p>{props.hours[0].is_open_now ? "It is Open" : "It is closed"}</p>
        ) : (
          DEFAULT_VALUE
        )}
        <p id="open-hours-el" onClick={() => setShowOpenHours(!showOpenHours)}>
          Open hours
        </p>
        <div id="open-hours-ele" className={showOpenHours ? "show" : "hide"}>
          {getOpenHours(props.hours)}
        </div>
        <div id="address-container">
          {props?.location_disp ? getAddress(props.location_disp) : DEFAULT_VALUE}
        </div>
        <div id="icon-container">
          {!props?.url ? (
            DEFAULT_VALUE
          ) : (
            <a href={props.url}>
              <i className="fas fa-link"></i>
            </a>
          )}
          {!props?.phone ? (
            DEFAULT_VALUE
          ) : (
            <i
              data-testid="phone-element"
              className="fas fa-phone-alt"
              onClick={() => setShowPhone(!showPhone)}
            >
              {showPhone ? <p>{props.phone}</p> : DEFAULT_VALUE}
            </i>
          )}

          <img
            src="/img/review.png"
            id="review-icon-img"
            alt="review icon"
            onClick={() => {
              setIdReviewData(props.id);
              setShowReview(!showReview);
            }}
          />
        </div>
      </div>
      <div id="images-container">
        <div id="main-img-container">
          {props?.photosArr ? (
            <img
              id="main-img"
              src={props.photosArr.length === 0 ? `/img/nullPicture.png` : props.photosArr[0]}
            />
          ) : (
            DEFAULT_VALUE
          )}
        </div>
        <div id="img-carousel">
          {props?.photosArr
            ? props.photosArr.map((item: string, index: number) => (
                <img key={index} onClick={() => setMainImg(item)} src={item} />
              ))
            : DEFAULT_VALUE}
        </div>
      </div>
      <div className={showReview ? "show" : "hide"}>
        <ItemReview
          url={props.url}
          revPos_lang={props.revPos_lang}
          revArr={props.revArr}
          revTotal={props.revTotal}
        />
      </div>
    </div>
  );
};
