import { ItemInfo, setDay, getOpenHours } from "../ItemInfo";
import { BrowserRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";

describe(`ItemInfo components test`, () => {
  describe(`hours.is_open_now = true, "It is Open" text in Document.`, () => {
    test(`phone key contains string, phone element in Document.`, () => {
      const selectedBusiness = {
        id: "1SSqz0bluenaujqRzZwxew",
        name: "Brandenburg Gate",
        phone: "039348 32984298",
        hours: [
          {
            hours_type: "REGULAR",
            is_open_now: true,
            open: [
              { is_overnight: true, start: "0900", end: "0500" },
              { is_overnight: true, start: "0900", end: "0500" },
              { is_overnight: true, start: "0900", end: "0500" },
              { is_overnight: true, start: "0900", end: "0500" },
              { is_overnight: true, start: "0900", end: "0500" },
              { is_overnight: true, start: "0900", end: "0500" },
              { is_overnight: true, start: "0900", end: "0500" },
            ],
          },
        ],
      };

      const children = {
        selectedBusiness: selectedBusiness,
        reviewData: { total: 0 },
      };
      const setIdReviewData = (idValue: string) => {};

      render(
        <BrowserRouter>
          <ItemInfo setIdReviewData={setIdReviewData}>{children}</ItemInfo>
        </BrowserRouter>,
      );

      expect(screen.getByText("It is Open")).toBeInTheDocument();
      expect(screen.queryByTestId("phone-element")).toBeInTheDocument();
    });
  });
});

describe(`ItemInfo and BasicInfoProd components test`, () => {
  describe(`hours.is_open_now = true, "It is Open" text in Document.`, () => {
    test(`phone key null, phone element is not in Document.`, () => {
      const selectedBusiness = {
        id: "1SSqz0bluenaujqRzZwxew",
        name: "Brandenburg Gate",
        phone: null,
        hours: [
          {
            hours_type: "REGULAR",
            is_open_now: false,
            open: [
              { is_overnight: true, start: "0900", end: "0500" },
              { is_overnight: true, start: "0900", end: "0500" },
              { is_overnight: true, start: "0900", end: "0500" },
              { is_overnight: true, start: "0900", end: "0500" },
              { is_overnight: true, start: "0900", end: "0500" },
              { is_overnight: true, start: "0900", end: "0500" },
              { is_overnight: true, start: "0900", end: "0500" },
            ],
          },
        ],
      };

      const children = {
        selectedBusiness: selectedBusiness,
        reviewData: { total: 0 },
      };
      const setIdReviewData = (idValue: string) => {};

      render(
        <BrowserRouter>
          <ItemInfo setIdReviewData={setIdReviewData}>{children}</ItemInfo>
        </BrowserRouter>,
      );

      expect(screen.getByText("It is closed")).toBeInTheDocument();
      expect(screen.queryByTestId("phone-element")).toBeNull();
    });
  });
});

describe(`ItemInfo and BasicInfoProd components test`, () => {
  test(`phone key undefined, phone element is not in Document.`, () => {
    const selectedBusiness = {
      id: "1SSqz0bluenaujqRzZwxew",
      name: "Brandenburg Gate",
    };

    const children = {
      selectedBusiness: selectedBusiness,
      reviewData: { total: 0 },
    };
    const setIdReviewData = (idValue: string) => {};

    render(
      <BrowserRouter>
        <ItemInfo setIdReviewData={setIdReviewData}>{children}</ItemInfo>
      </BrowserRouter>,
    );

    expect(screen.queryByTestId("phone-element")).toBeNull();
  });
});

describe("setDay function", () => {
  test("return day of week <string> wiht a day<number> input", () => {
    expect(setDay(3)).toEqual("Thursday");
  });
});

describe("getOpenHours function", () => {
  test("return day of week <string> wiht a day<number> input", () => {
    const selectedBusiness = {
      id: "1SSqz0bluenaujqRzZwxew",
      name: "Brandenburg Gate",
      hours: [
        {
          open: [
            { is_overnight: true, start: "0900", end: "0500" },
            { is_overnight: true, start: "0900", end: "0500" },
            { is_overnight: true, start: "0900", end: "0500" },
            { is_overnight: true, start: "0900", end: "0500" },
            { is_overnight: true, start: "0900", end: "0500" },
            { is_overnight: true, start: "0900", end: "0500" },
            { is_overnight: true, start: "0900", end: "0500" },
          ],
        },
      ],
    };
    const result = getOpenHours(selectedBusiness);
    let text = ``;
    result.map((item) => (text += item.props.children));
    expect(text).toEqual(
      "Monday 09:00 - 05:00Tuesday 09:00 - 05:00Wednesday 09:00 - 05:00Thursday 09:00 - 05:00Friday 09:00 - 05:00Saturday 09:00 - 05:00Sunday 09:00 - 05:00",
    );
  });
});
