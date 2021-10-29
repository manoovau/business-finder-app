import { Pagination } from "../index";
import { render, screen } from "@testing-library/react";

describe(`Pagination components test`, () => {
  describe(`currentPage and totalPages DEFAULT VALUES`, () => {
    test(`"decrement-button", "pagination-info" and "increment-button" are not in the Document`, () => {
      const children = {
        currentPage: 1,
        totalPage: 0,
      };
      const incrementPage = (): void => {};

      const decrementPage = (): void => {};

      render(
        <Pagination incrementPage={incrementPage} decrementPage={decrementPage}>
          {children}
        </Pagination>,
      );

      expect(screen.queryByTestId("decrement-button")).toBeNull();
      expect(screen.queryByTestId("pagination-info")).toBeNull();
      expect(screen.queryByTestId("increment-button")).toBeNull();
    });
  });
});

describe(`Pagination components test`, () => {
  describe(`currentPage < totalPages && currentPage = DEFAULT_VALUE, totalPages != DEFAULT_VALUE`, () => {
    test(`phone key contains string, phone element in Document.`, () => {
      const children = {
        currentPage: 1,
        totalPage: 10,
      };
      const incrementPage = (): void => {};

      const decrementPage = (): void => {};

      render(
        <Pagination incrementPage={incrementPage} decrementPage={decrementPage}>
          {children}
        </Pagination>,
      );

      expect(screen.queryByTestId("decrement-button")).toBeNull();
      expect(screen.queryByTestId("pagination-info")).toBeInTheDocument();
      expect(screen.queryByTestId("increment-button")).toBeInTheDocument();
    });
  });
});

describe(`Pagination components test`, () => {
  describe(`currentPage < totalPages && currentPage != DEFAULT_VALUE, totalPages != DEFAULT_VALUE`, () => {
    test(`phone key contains string, phone element in Document.`, () => {
      const children = {
        currentPage: 3,
        totalPage: 10,
      };
      const incrementPage = (): void => {};

      const decrementPage = (): void => {};

      render(
        <Pagination incrementPage={incrementPage} decrementPage={decrementPage}>
          {children}
        </Pagination>,
      );

      expect(screen.queryByTestId("decrement-button")).toBeInTheDocument();
      expect(screen.queryByTestId("pagination-info")).toBeInTheDocument();
      expect(screen.queryByTestId("increment-button")).toBeInTheDocument();
    });
  });
});

describe(`Pagination components test`, () => {
  describe(`currentPage = totalPages && currentPage != DEFAULT_VALUE, totalPages != DEFAULT_VALUE`, () => {
    test(`phone key contains string, phone element in Document.`, () => {
      const children = {
        currentPage: 10,
        totalPage: 10,
      };
      const incrementPage = (): void => {};

      const decrementPage = (): void => {};

      render(
        <Pagination incrementPage={incrementPage} decrementPage={decrementPage}>
          {children}
        </Pagination>,
      );

      expect(screen.queryByTestId("decrement-button")).toBeInTheDocument();
      expect(screen.queryByTestId("pagination-info")).toBeInTheDocument();
      expect(screen.queryByTestId("increment-button")).toBeNull();
    });
  });
});
