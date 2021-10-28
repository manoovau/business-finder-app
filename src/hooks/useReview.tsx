import React from "react";

/**
 * create rating icon element
 * @param num rating number
 * @returns array with rating icon
 */
export const createIconReview = (num: number) => {
  const iconHTML = [];
  const totalStar = 5;
  const emptyStar = Math.floor(totalStar - num);
  const fullStarNum = Math.floor(num);
  for (let i = 0; i < fullStarNum; i++) {
    iconHTML.push(<i key={i} className="fas fa-star"></i>);
  }
  if (num % 1 >= 0.1 && num % 1 < 0.3) {
    iconHTML.push(<i key={5} className="far fa-star"></i>);
  } else if (num % 1 >= 0.3 && num % 1 < 0.8) {
    iconHTML.push(<i key={5} className="fas fa-star-half-alt"></i>);
  } else if (num % 1 >= 0.8) {
    iconHTML.push(<i key={5} className="fas fa-star"></i>);
  }
  if (emptyStar > 0) {
    for (let i = 0; i < emptyStar; i++) {
      iconHTML.push(<i key={i + totalStar + 1} className="far fa-star"></i>);
    }
  }

  return iconHTML;
};
