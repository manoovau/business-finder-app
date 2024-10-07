import React from "react";
import { categoriesType } from "../interface";
import { createIconReview } from "../hooks/useReview";

type Props = {
  name?: string;
  price?: string;
  rating?: number;
  review_count?: number;
  is_closed?: boolean;
  categories?: categoriesType[];
  is_item_info?: boolean;
};

/**
 * collect "title" key information inside categoriesType array
 * @param data categoriesType array
 * @returns p element with title key information for each object inside categoriesType array
 */
const getCategories = (data: categoriesType[]): JSX.Element => {
  let htmlText = "";
  if (data) {
    data.map((item: categoriesType, index: number) => {
      if (index !== 0) {
        htmlText += `, ${item.title}`;
      } else {
        htmlText += `${item.title}`;
      }
    });
  }

  return <p>{htmlText}</p>;
};

export const BasicInfoProd = (props: Props): JSX.Element => {
  return (
    <div id="basic-info-container" className="flex flex-col w-full justify-start pl-6">
      <h2 className="font-semibold pb-4">{props?.name}</h2>
      <div className={props?.is_item_info ? "flex flex-wrap justify-center" : "flex flex-wrap"}>
        {props?.rating && (
          <div data-testid="rating-test" className="pr-4">
            {createIconReview(props.rating)}
          </div>
        )}{" "}
        {props?.review_count}
      </div>

      <div
        id="price-categ-container"
        className={props?.is_item_info ? "flex justify-center" : "flex "}
      >
        {props?.price && <p className="mr-4 price">{props.price}</p>}
        <div id="categories-container" className="flex flex-wrap">
          {props?.categories && getCategories(props.categories)}
        </div>
      </div>
      {props?.is_closed && <p data-testid="is-perm-closed">Sorry, it is permanently closed</p>}
    </div>
  );
};
