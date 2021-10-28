import { BasicInfoProd } from "../index";
import { render, screen } from "@testing-library/react";

describe(`BasicInfoProd components test`, () => {
  describe(`is_closed = false, is-perm-closed element is not in Document`, () => {
    test(``, () => {
      const selectedBusiness = {
        id: "1SSqz0bluenaujqRzZwxew",
        is_closed: false,
        name: "Brandenburg Gate",
      };

      render(<BasicInfoProd>{selectedBusiness}</BasicInfoProd>);

      expect(screen.queryByTestId("is-perm-closed")).toBeNull();
      expect(screen.queryByTestId("rating-test")).toBeNull();
    });
  });
});

describe(`BasicInfoProd components test`, () => {
  describe(`is_closed = false, is-perm-closed element is not in Document`, () => {
    test(``, () => {
      const selectedBusiness = {
        id: "1SSqz0bluenaujqRzZwxew",
        is_closed: true,
        name: "Brandenburg Gate",
        rating: 3,
      };

      render(<BasicInfoProd>{selectedBusiness}</BasicInfoProd>);

      expect(screen.queryByTestId("is-perm-closed")).toBeInTheDocument();
      expect(screen.queryByTestId("rating-test")).toBeInTheDocument();
    });
  });
});
