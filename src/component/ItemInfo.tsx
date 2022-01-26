import React, { useEffect, useState } from "react";
import { OpenType, HoursType, CenterType } from "../interface";
import { MapPageItem } from "./index";

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
        <p key={getDay(index)}>{`${getDay(index)} ${item.start.substring(0, 2)}:${item.start.slice(
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
  const { setIdReviewData, setShowReview } = props;

  const DEFAULT_VALUE = null;

  const [showOpenHours, setShowOpenHours] = useState<boolean>(false);
  const [showPhone, setShowPhone] = useState<boolean>(false);
  const [mainSrc, setMainSrc] = useState<string>("");

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
        {props?.hours ? (
          <p data-testid="is-open">{props.hours[0].is_open_now ? "It is Open" : "It is closed"}</p>
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
              setShowReview(!props.showReview);
            }}
          />
        </div>
      </div>
      <div id="images-container">
        <div id="main-img-container">
          {props?.photosArr ? <img id="main-img" src={mainSrc} /> : DEFAULT_VALUE}
        </div>
        <div id="img-carousel">
          {props?.photosArr
            ? props.photosArr.map((item: string, index: number) => (
                <img key={`photo${index}`} onClick={() => setMainSrc(item)} src={item} />
              ))
            : DEFAULT_VALUE}
        </div>
      </div>
      {props?.coordinates ? (
        <div id="map-item">
          <MapPageItem region={props.coordinates} />
        </div>
      ) : (
        DEFAULT_VALUE
      )}
    </div>
  );
};
