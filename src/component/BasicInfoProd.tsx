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
  const DEFAULT_VALUE = null;
  return (
    <div id="basic-info-container">
      <h2>{props?.name}</h2>
      <div className="rating">
        {props?.rating ? (
          <div data-testid="rating-test">{createIconReview(props.rating)}</div>
        ) : (
          DEFAULT_VALUE
        )}{" "}
        {props?.review_count}
      </div>

      <div id="price-categ-container">
        {props?.price ? <p className="price">{props.price}</p> : DEFAULT_VALUE}
        <div id="categories-container">
          {props?.categories ? getCategories(props.categories) : DEFAULT_VALUE}
        </div>
      </div>
      {props?.is_closed ? (
        <p data-testid="is-perm-closed">Sorry, it is permanently closed</p>
      ) : (
        DEFAULT_VALUE
      )}
    </div>
  );
};
