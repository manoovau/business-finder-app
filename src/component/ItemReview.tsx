import React from "react";
import { reviewsType } from "../interface";
import { createIconReview } from "../hooks/useReview";

type Props = {
  url?: string | null;
  revPos_lang?: string[];
  revArr?: reviewsType[];
  revTotal: number;
};

/**
 *Get language string after provide language code string
 * @param possibLanguage language code
 * @returns language string
 */
export const getLanguage = (possibLanguage: string): string => {
  switch (possibLanguage) {
    case "cs":
      return "Czech";
    case "da":
      return "Danish";
    case "de":
      return "German";
    case "en":
      return "English";
    case "es":
      return "Spanish";
    case "fi":
      return "Finnish";
    case "fil":
      return "Filipino";
    case "fr":
      return "French";
    case "it":
      return "Italian";
    case "ja":
      return "Japanese";
    case "ms":
      return "Malay";
    case "nb":
      return "Norwegian";
    case "nl":
      return "Dutch";
    case "pl":
      return "Polish";
    case "pt":
      return "Portuguese";
    case "sv":
      return "Swedish";
    case "tr":
      return "Turkish";
    case "zh":
      return "Chinese";
    default:
      return "";
  }
};

export const ItemReview = (props: Props): JSX.Element => {
  const DEFAULT_VALUE = null;
  return (
    <div id="id-review-container">
      <h4>Available languages</h4>
      {props?.revPos_lang ? (
        <div id="possib-lang" data-testid="possib-lang-test-id">
          {props.revPos_lang.map((item: string, index: number) => {
            return <p key={index}>{getLanguage(item)}</p>;
          })}
        </div>
      ) : (
        DEFAULT_VALUE
      )}
      <div id="reviews-container">
        <h5>Review Highlights</h5>
        {props?.revArr
          ? props.revArr.map((item: reviewsType, index: number) => {
              return (
                <div className="review" key={index}>
                  <div className="review-user">
                    {!item.user.profile_url ? (
                      <h5>{item.user.name}</h5>
                    ) : (
                      <a data-testid="profile-url" href={item.user.profile_url}>
                        <h5>{item.user.name}</h5>
                      </a>
                    )}
                    {!item.user.image_url ? (
                      <img className="img-user" src={"/img/nullUser.png"} alt="user image url" />
                    ) : (
                      <img className="img-user" src={item.user.image_url} alt="user image url" />
                    )}
                  </div>
                  <div className="rating-time-container">
                    {createIconReview(item.rating)}
                    <p>{item.time_created}</p>
                  </div>
                  <div id="review-text-container">
                    <p className="review-text">{item.text}</p>
                    {item?.text?.substr(item?.text?.length - 3) === "..." && props.url ? (
                      <a href={props.url}>See more</a>
                    ) : (
                      DEFAULT_VALUE
                    )}
                  </div>
                </div>
              );
            })
          : DEFAULT_VALUE}
        {!props.url ? DEFAULT_VALUE : <a href={props.url}>See more reviews ({props.revTotal})</a>}
      </div>
    </div>
  );
};
