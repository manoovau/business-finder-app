import React from "react";

/**
 * create rating icon element
 * @param num rating number
 * @returns array with rating icon
 */
export const createIconReview = (num: number) => {
  const iconHtmlArr = [];
  const TOTAL_STAR = 5;
  const EMPTY_STAR = Math.floor(TOTAL_STAR - num);
  const FULL_STAR_NUM = Math.floor(num);
  for (let i = 0; i < FULL_STAR_NUM; i++) {
    iconHtmlArr.push(<i key={`star${i}`} className="fas fa-star"></i>);
  }
  if (num % 1 >= 0.1 && num % 1 < 0.3) {
    iconHtmlArr.push(<i key={`star${TOTAL_STAR}`} className="far fa-star"></i>);
  } else if (num % 1 >= 0.3 && num % 1 < 0.8) {
    iconHtmlArr.push(<i key={`star${TOTAL_STAR}`} className="fas fa-star-half-alt"></i>);
  } else if (num % 1 >= 0.8) {
    iconHtmlArr.push(<i key={`star${TOTAL_STAR}`} className="fas fa-star"></i>);
  }
  if (EMPTY_STAR > 0) {
    for (let i = 0; i < EMPTY_STAR; i++) {
      iconHtmlArr.push(<i key={`star${i + TOTAL_STAR + 1}`} className="far fa-star"></i>);
    }
  }

  return iconHtmlArr;
};
