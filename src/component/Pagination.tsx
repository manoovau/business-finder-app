import React from "react";

type Props = {
  currentPage: number;
  totalPage: number;
  incrementPage: () => void;
  decrementPage: () => void;
};

export const Pagination = (props: Props): JSX.Element => {
  const { incrementPage, decrementPage } = props;
  const DEFAULT_CURRENT_PAGE = 1;
  const DEFAULT_VALUE = null;

  return (
    <div id="pagination-container">
      {props.currentPage !== DEFAULT_CURRENT_PAGE ? (
        <button
          data-testid="decrement-button"
          className="pagination-btn"
          onClick={decrementPage}
        >{` < `}</button>
      ) : (
        DEFAULT_VALUE
      )}

      {props.totalPage > DEFAULT_CURRENT_PAGE ? (
        <p data-testid="pagination-info">
          {props.currentPage} of {props.totalPage}
        </p>
      ) : (
        DEFAULT_VALUE
      )}

      {props.currentPage !== props.totalPage && props.totalPage > DEFAULT_CURRENT_PAGE ? (
        <button
          data-testid="increment-button"
          className="pagination-btn"
          onClick={incrementPage}
        >{` > `}</button>
      ) : (
        DEFAULT_VALUE
      )}
    </div>
  );
};
