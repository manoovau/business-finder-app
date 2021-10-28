import React from "react";
import { ItemInfoType, categoriesType } from "../interface";
import { createIconReview } from "../hooks/useReview";

type Props = {
  children: ItemInfoType | undefined;
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

export const BasicInfoProd = ({ children }: Props): JSX.Element => {
  const DEFAULT_VALUE = null;
  return (
    <div id="basic-info-container">
      <h2>{children?.name}</h2>
      <div className="rating">
        {children?.rating ? (
          <div data-testid="rating-test">{createIconReview(children.rating)}</div>
        ) : (
          DEFAULT_VALUE
        )}{" "}
        {children?.review_count}
      </div>

      <div id="price-categ-container">
        {children?.price ? <p className="price">{children.price}</p> : DEFAULT_VALUE}
        <div id="categories-container">
          {children?.categories ? getCategories(children.categories) : DEFAULT_VALUE}
        </div>
      </div>
      {children?.is_closed ? (
        <p data-testid="is-perm-closed">Sorry, it is permanently closed</p>
      ) : (
        DEFAULT_VALUE
      )}
    </div>
  );
};
