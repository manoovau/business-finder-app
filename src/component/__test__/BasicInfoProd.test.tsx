import { BasicInfoProd } from "../index";
import { render, screen } from "@testing-library/react";

describe(`BasicInfoProd components test`, () => {
  test(`is_closed = false, is-perm-closed element is not in Document`, () => {
    const selectedBusiness = {
      id: "1SSqz0bluenaujqRzZwxew",
      is_closed: false,
      name: "Brandenburg Gate",
    };

    render(
      <BasicInfoProd
        name={selectedBusiness?.name}
        is_closed={selectedBusiness?.is_closed}
        is_item_info={false}
      />,
    );

    expect(screen.queryByTestId("is-perm-closed")).toBeNull();
    expect(screen.queryByTestId("rating-test")).toBeNull();
  });
});

describe(`BasicInfoProd components test`, () => {
  test(`is_closed = false, is-perm-closed element is not in Document`, () => {
    const selectedBusiness = {
      id: "1SSqz0bluenaujqRzZwxew",
      is_closed: true,
      name: "Brandenburg Gate",
      rating: 3,
    };

    render(
      <BasicInfoProd
        name={selectedBusiness.name}
        rating={selectedBusiness.rating}
        is_closed={selectedBusiness.is_closed}
        is_item_info={false}
      />,
    );

    expect(screen.queryByTestId("is-perm-closed")).toBeInTheDocument();
    expect(screen.queryByTestId("rating-test")).toBeInTheDocument();
  });
});
