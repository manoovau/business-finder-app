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

  return (
    <div className="flex flex-row justify-center items-center my-12 mx-4">
      {props.currentPage !== DEFAULT_CURRENT_PAGE && (
        <button
          data-testid="decrement-button"
          className="px-4"
          onClick={decrementPage}
        >{` < `}</button>
      )}

      {props.totalPage > DEFAULT_CURRENT_PAGE && (
        <p data-testid="pagination-info">
          {props.currentPage} of {props.totalPage}
        </p>
      )}

      {props.currentPage !== props.totalPage && props.totalPage > DEFAULT_CURRENT_PAGE && (
        <button
          data-testid="increment-button"
          className="px-4"
          onClick={incrementPage}
        >{` > `}</button>
      )}
    </div>
  );
};
