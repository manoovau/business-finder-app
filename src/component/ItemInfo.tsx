import React, { useEffect, useState } from "react";
import { OpenType, HoursType, CenterType } from "../interface";

type Props = {
  id: string;
  hours?: HoursType[];
  location_disp?: string[];
  url?: string | null;
  phone?: string | null;
  photosArr?: string[];
  coordinates?: CenterType;
  showReview: boolean;
  setShowReview: (showReview: boolean) => void;
  setIdReviewData: (id: string) => void;
};

const EMPTY_STRING = "";

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
      return EMPTY_STRING;
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
        <p key={getDay(index)}>{`${getDay(index).slice(0, 3)} ${item.start.substring(
          0,
          2,
        )}:${item.start.slice(2)} - ${item.end.substring(0, 2)}:${item.end.slice(2)}`}</p>,
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
  let htmlText = EMPTY_STRING;
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
  const { setIdReviewData, setShowReview } = props;

  const [showOpenHours, setShowOpenHours] = useState<boolean>(false);
  const [showPhone, setShowPhone] = useState<boolean>(false);
  const [mainSrc, setMainSrc] = useState<string>(EMPTY_STRING);

  useEffect(() => {
    setShowOpenHours(false);
    setShowReview(false);
    !props.photosArr || props.photosArr.length === 0
      ? setMainSrc(`/img/nullPicture.png`)
      : setMainSrc(props.photosArr[0]);
  }, [props.id]);

  return (
    <div id="item-info-container">
      <div id="info-container">
        {props?.hours && (
          <p data-testid="is-open">{props.hours[0].is_open_now ? "It is Open" : "It is closed"}</p>
        )}
        {props?.hours && (
          <div
            id="open-hours-el"
            className="cursor-pointer mb-4"
            onClick={() => setShowOpenHours(!showOpenHours)}
          >
            Open hours
            <div id="open-hours-ele" className={showOpenHours ? "block" : "hidden"}>
              {getOpenHours(props.hours)}
            </div>
          </div>
        )}
        <div id="address-container">{props?.location_disp && getAddress(props.location_disp)}</div>
        <div id="icon-container" className="w-full h-auto flex justify-center">
          {props?.url && (
            <a href={props.url}>
              <i className="fas fa-link m-2"></i>
            </a>
          )}
          {props?.phone && (
            <i
              data-testid="phone-element"
              className="fas fa-phone-alt m-2"
              onClick={() => setShowPhone(!showPhone)}
            >
              {showPhone && <p>{props.phone}</p>}
            </i>
          )}

          <img
            src="/img/review.png"
            id="review-icon-img"
            alt="review icon"
            className="w-6 h-auto cursor-pointer m-2"
            onClick={() => {
              setIdReviewData(props.id);
              setShowReview(!props.showReview);
            }}
          />
        </div>
      </div>
      <div id="images-container" className="flex flex-col justify-center sm:flex-row ">
        <div id="main-img-container" className="flex justify-center">
          {props?.photosArr && (
            <img
              id="main-img"
              className="sm:w-96 sm:h-96 w-48 h-48 object-cover cursor-pointer"
              src={mainSrc}
            />
          )}
        </div>
        <div
          id="img-carousel"
          className="object-cover cursor-pointer flex flex-row  flex-wrap justify-center m-1 sm:flex-col"
        >
          {props?.photosArr &&
            props.photosArr.map((item: string, index: number) => (
              <img
                key={`photo${index}`}
                onClick={() => setMainSrc(item)}
                src={item}
                className="w-12 h-12 object-cover cursor-pointer m-1 sm:w-24 sm:h-24"
              />
            ))}
        </div>
      </div>
    </div>
  );
};
