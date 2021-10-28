import React, { useEffect, useState } from "react";
import { ItemInfoType, OpenType, ItemInfoChildrenType } from "../interface";
import { BasicInfoProd, ItemReview } from "./index";
import { Link } from "react-router-dom";

type Props = {
  children: ItemInfoChildrenType;
  setIdReviewData: (id: string) => void;
};

/**
 * set url inside main image element
 * @param srcValue image url string
 */
export const setMainImg = (srcValue: string): void => {
  const mainImgEle = document.getElementById("main-img");
  if (mainImgEle) mainImgEle.setAttribute("src", srcValue);
};

/**
 * set Week day
 * @param index number (week day)
 * @returns Week day string
 */
export const setDay = (index: number): string => {
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
 * @param children selected object data
 * @returns Open hours element
 */
export const getOpenHours = (children: ItemInfoType | undefined) => {
  const openHoursArr: JSX.Element[] = [];
  if (children?.hours) {
    children.hours[0].open.map((item: OpenType, index: number) => {
      openHoursArr.push(
        <p key={index}>{`${setDay(index)} ${item.start.substring(0, 2)}:${item.start.slice(
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
 * @returns address string
 */
const getAddress = (data: string[]): JSX.Element => {
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
  const { children, setIdReviewData } = props;
  const [selectedBusiness, setSelectedBusiness] = useState<ItemInfoType>();
  const [showReview, setShowReview] = useState<boolean>(false);

  useEffect(() => {
    setSelectedBusiness(children.selectedBusiness);
  }, [children]);

  const DEFAULT_VALUE = null;
  const [openHoursEle, setOpenHoursEle] = useState<JSX.Element[]>([]);
  const [showOpenHours, setShowOpenHours] = useState<boolean>(false);
  const [showPhone, setShowPhone] = useState<boolean>(false);

  useEffect(() => {
    setOpenHoursEle(getOpenHours(selectedBusiness));
    setShowOpenHours(false);
    setShowReview(false);
  }, [selectedBusiness]);

  return (
    <div id="item-info-container">
      <div id="info-container">
        <Link to="/" id="title">
          <h1>{`< Go Back `}</h1>
        </Link>
        <BasicInfoProd>{selectedBusiness}</BasicInfoProd>
        {selectedBusiness?.hours ? (
          <p>{selectedBusiness.hours[0].is_open_now ? "It is Open" : "It is closed"}</p>
        ) : (
          DEFAULT_VALUE
        )}
        <p id="open-hours-el" onClick={() => setShowOpenHours(!showOpenHours)}>
          Open hours
        </p>
        <div id="open-hours-ele" className={showOpenHours ? "show" : "hide"}>
          {openHoursEle}
        </div>
        <div id="address-container">
          {selectedBusiness?.location?.display_address
            ? getAddress(selectedBusiness.location.display_address)
            : DEFAULT_VALUE}
        </div>
        <div id="icon-container">
          {!selectedBusiness?.url ? (
            DEFAULT_VALUE
          ) : (
            <a href={selectedBusiness.url}>
              <i className="fas fa-link"></i>
            </a>
          )}
          {!selectedBusiness?.phone ? (
            DEFAULT_VALUE
          ) : (
            <i
              data-testid="phone-element"
              className="fas fa-phone-alt"
              onClick={() => setShowPhone(!showPhone)}
            >
              {showPhone ? <p>{selectedBusiness.phone}</p> : DEFAULT_VALUE}
            </i>
          )}

          <img
            src="/img/review.png"
            alt="review icon"
            onClick={() => {
              setIdReviewData(children.selectedBusiness.id);
              setShowReview(!showReview);
            }}
          />
        </div>
      </div>
      <div id="images-container">
        <div id="main-img-container">
          {selectedBusiness?.photos ? (
            <img id="main-img" src={selectedBusiness.photos[0]} />
          ) : (
            DEFAULT_VALUE
          )}
        </div>
        <div id="img-carousel">
          {selectedBusiness?.photos
            ? selectedBusiness.photos.map((item: string, index: number) => (
                <img key={index} onClick={() => setMainImg(item)} src={item} />
              ))
            : DEFAULT_VALUE}
        </div>
      </div>
      <div className={showReview ? "show" : "hide"}>
        <ItemReview>{children}</ItemReview>
      </div>
    </div>
  );
};
