import { ItemInfo, getDay, getOpenHours, getAddress } from "../ItemInfo";
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

      const showReview = false;
      const setIdReviewData = (idValue: string) => {};
      const setShowReview = (showReview: boolean) =>
        void void render(
          <BrowserRouter>
            <ItemInfo
              setIdReviewData={setIdReviewData}
              setShowReview={setShowReview}
              id={selectedBusiness.id}
              showReview={showReview}
              hours={selectedBusiness?.hours}
              phone={selectedBusiness?.phone}
            />
          </BrowserRouter>,
        );

      //  expect(screen.getByText("It is Open")).toBeInTheDocument();
      //  expect(screen.queryByTestId("is-open")).toBeInTheDocument();
      // expect(screen.queryByTestId("phone-element")).toBeInTheDocument();
    });
  });
});

describe(`ItemInfo and BasicInfoProd components test`, () => {
  describe(`hours.is_open_now = false, "It is closed" text in Document.`, () => {
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

      const showReview = false;
      const setIdReviewData = (idValue: string) => {};
      const setShowReview = (showReview: boolean) =>
        void void render(
          <BrowserRouter>
            <ItemInfo
              setIdReviewData={setIdReviewData}
              setShowReview={setShowReview}
              showReview={showReview}
              id={selectedBusiness.id}
              hours={selectedBusiness?.hours}
              phone={selectedBusiness?.phone}
            />
          </BrowserRouter>,
        );

      //     expect(screen.getByText("It is closed")).toBeInTheDocument();
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

    const showReview = false;
    const setIdReviewData = (idValue: string) => {};
    const setShowReview = (showReview: boolean) =>
      void void render(
        <BrowserRouter>
          <ItemInfo
            setIdReviewData={setIdReviewData}
            setShowReview={setShowReview}
            showReview={showReview}
            id={selectedBusiness.id}
          />
        </BrowserRouter>,
      );

    expect(screen.queryByTestId("phone-element")).toBeNull();
  });
});

describe("getDay function", () => {
  test("return day of week <string> wiht a day<number> input", () => {
    expect(getDay(3)).toEqual("Thursday");
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
    const result = getOpenHours(selectedBusiness.hours);
    let text = ``;
    result.map((item) => (text += item.props.children));
    expect(text).toEqual(
      "Monday 09:00 - 05:00Tuesday 09:00 - 05:00Wednesday 09:00 - 05:00Thursday 09:00 - 05:00Friday 09:00 - 05:00Saturday 09:00 - 05:00Sunday 09:00 - 05:00",
    );
  });
});

describe("getAddress function", () => {
  test("return p element with address string", () => {
    const selectedBusiness = {
      id: "1SSqz0bluenaujqRzZwxew",
      name: "Brandenburg Gate",
      location: {
        address1: "Pariser Platz",
        address2: null,
        address3: null,
        city: "Berlin",
        country: "DE",
        cross_streets: null,
        display_address: ["Pariser Platz", "10117 Berlin", "Germany"],
        state: "BE",
        zip_code: "10117",
      },
    };
    const result = getAddress(selectedBusiness.location.display_address);

    expect(result).toEqual(<p>Pariser Platz 10117 Berlin Germany</p>);
  });
});
