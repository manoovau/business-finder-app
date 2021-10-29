import React from "react";
import { pageInfoType } from "../interface";

type Props = {
  children: pageInfoType;
  incrementPage: () => void;
  decrementPage: () => void;
};

export const Pagination = (props: Props): JSX.Element => {
  const { children, incrementPage, decrementPage } = props;
  const DEFAULT_CURRENT_PAGE = 1;

  return (
    <div id="pagination-container">
      {children.currentPage !== DEFAULT_CURRENT_PAGE ? (
        <button
          data-testid="decrement-button"
          className="pagination-btn"
          onClick={decrementPage}
        >{` < `}</button>
      ) : null}

      {children.totalPage > DEFAULT_CURRENT_PAGE ? (
        <p data-testid="pagination-info">
          `${children.currentPage} of ${children.totalPage}`{" "}
        </p>
      ) : null}

      {children.currentPage !== children.totalPage && children.totalPage > DEFAULT_CURRENT_PAGE ? (
        <button
          data-testid="increment-button"
          className="pagination-btn"
          onClick={incrementPage}
        >{` > `}</button>
      ) : null}
    </div>
  );
};
