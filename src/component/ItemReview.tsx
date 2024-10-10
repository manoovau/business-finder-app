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
  return (
    <div id="id-review-container">
      {props?.revPos_lang && (
        <div id="possib-lang" data-testid="possib-lang-test-id">
          <h4>Available languages</h4>
          {props.revPos_lang.map((item: string, index: number) => {
            return <p key={`lang${index}`}>{getLanguage(item)}</p>;
          })}
        </div>
      )}
      <div id="reviews-container" className="w-full">
        <h5>Review Highlights</h5>
        {props?.revArr &&
          props.revArr.map((item: reviewsType, index: number) => {
            return (
              <div
                className="review m-8 sm:flex sm:rating-time-container sm:flex-row ml-8 justify-center"
                key={`review${index}`}
              >
                <div className="flex flex-row">
                  <div className="flex flex-col mx-4 my-2 sm:mx-10 sm:my-4">
                    {!item.user.image_url ? (
                      <img
                        className="mx-1 img-user w-12 h-12 sm:w-24 sm:h-24"
                        src={"/img/nullUser.png"}
                        alt="user image url"
                      />
                    ) : (
                      <img
                        className="mx-1 img-user w-12 h-12 sm:w-24 sm:h-24 object-cover"
                        src={item.user.image_url}
                        alt="user image url"
                      />
                    )}
                    <div className="review-user font-semibold">
                      {!item.user.profile_url ? (
                        <h5 className="mx-1">{item.user.name}</h5>
                      ) : (
                        <a data-testid="profile-url" href={item.user.profile_url}>
                          <h5 className="mx-1">{item.user.name}</h5>
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col min-w-60 sm:w-[768px] sm:mx-10 sm:my-4">
                    <div className="rating-time-container flex flex-col sm:flex-row justify-start">
                      <div className="flex">{createIconReview(item.rating)}</div>
                      <p className="ml-0 sm:ml-8 flex">{item.time_created}</p>
                    </div>
                    <div id="review-text-container" className="max-w-60 sm:max-w-screen-md">
                      <p className="review-text text-left my-2">{item.text}</p>
                      {item?.text?.substr(item?.text?.length - 3) === "..." && props.url && (
                        <a href={props.url}>See more</a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        {props.url && <a href={props.url}>See more reviews ({props.revTotal})</a>}
      </div>
    </div>
  );
};
