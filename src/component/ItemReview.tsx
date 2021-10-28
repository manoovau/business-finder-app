import React from "react";
import { ItemInfoChildrenType, reviewsType } from "../interface";
import { createIconReview } from "../hooks/useReview";

type Props = {
  children: ItemInfoChildrenType;
};

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

export const ItemReview = ({ children }: Props): JSX.Element => {
  const { reviewData, selectedBusiness } = children;
  const DEFAULT_VALUE = null;
  return (
    <div id="id-review-container">
      <h4>Available languages</h4>

      {reviewData?.possible_languages ? (
        <div id="possib-lang" data-testid="possib-lang-test-id">
          {reviewData?.possible_languages.map((item: string, index: number) => {
            return <p key={index}>{getLanguage(item)}</p>;
          })}
        </div>
      ) : (
        DEFAULT_VALUE
      )}

      <div id="reviews-container">
        <h5>Review Highlights</h5>
        {reviewData?.reviews
          ? reviewData.reviews.map((item: reviewsType, index: number) => {
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

                  <p className="review-text">{item.text}</p>
                  {item?.text ? console.log(item.text.charAt(1)) : null}
                </div>
              );
            })
          : DEFAULT_VALUE}
        {!selectedBusiness.url ? (
          DEFAULT_VALUE
        ) : (
          <a href={selectedBusiness.url}>See more reviews ({reviewData.total})</a>
        )}
      </div>
    </div>
  );
};
// console.log(str.substring(str.length - 3) === "...");
