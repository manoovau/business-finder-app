import { ItemReview, getLanguage } from "../ItemReview";
import { render, screen } from "@testing-library/react";
import { shallow } from "enzyme";

describe("ItemReview component test", () => {
  describe(`test if component contains text for:`, () => {
    test(`h4 element: "Available languages", user.name element: "Suavecito M." and possib-lang element: "English"`, () => {
      const ReviewChildren = {
        reviews: [
          {
            id: "SIoiwwVRH6R2s2ipFfs4Ww",
            rating: 4,
            user: {
              id: "rpOyqD_893cqmDAtJLbdog",
              name: "Suavecito M.",
            },
          },
        ],
        total: 3,
        possible_languages: ["zh", "sv", "tr"],
      };

      render(
        <ItemReview
          revPos_lang={ReviewChildren.possible_languages}
          revArr={ReviewChildren.reviews}
          revTotal={ReviewChildren.total}
        />,
      );

      expect(screen.getByText("Available languages")).toBeInTheDocument();
      expect(screen.getByText("Suavecito M.")).toBeInTheDocument();
      expect(screen.getByText("Chinese")).toBeInTheDocument();
      expect(screen.getByText("Swedish")).toBeInTheDocument();
      expect(screen.getByText("Turkish")).toBeInTheDocument();

      expect(screen.getByTestId("possib-lang-test-id")).toBeInTheDocument();
    });
  });
});

describe("ItemReview component test", () => {
  describe("test img element: src (valid url) and alt field", () => {
    test("test profile-url element is null: user.profile_url = null  ", () => {
      const ReviewChildren = {
        reviews: [
          {
            id: "xAG4O7l-t1ubbwVAlPnDKg",
            rating: 5,
            user: {
              id: "W8UK02IDdRS2GL_66fuq6w",
              profile_url: null,
              image_url: "https://s3-media3.fl.yelpcdn.com/photo/iwoAD12zkONZxJ94ChAaMg/o.jpg",
              name: "Ella A.",
            },
          },
        ],
        total: 3,
        possible_languages: ["de"],
      };

      render(
        <ItemReview
          revPos_lang={ReviewChildren.possible_languages}
          revArr={ReviewChildren.reviews}
          revTotal={ReviewChildren.total}
        />,
      );

      expect(screen.queryByTestId("profile-url")).toBeNull();

      const imgElement = screen.getByRole("img");
      expect(imgElement).toHaveAttribute(
        "src",
        "https://s3-media3.fl.yelpcdn.com/photo/iwoAD12zkONZxJ94ChAaMg/o.jpg",
      );
      expect(imgElement).toHaveAttribute("alt", "user image url");
    });
  });
});

describe("ItemReview component test: ", () => {
  describe("test img element: src (null url) and alt field", () => {
    test("test profile-url element toBeInDocument: user.profile_url is not null", () => {
      const selectedBusinessUrl = "url";
      const ReviewChildren = {
        reviews: [
          {
            id: "xAG4O7l-t1ubbwVAlPnDKg",
            rating: 5,
            user: {
              id: "W8UK02IDdRS2GL_66fuq6w",
              profile_url: "profileUrl",
              image_url: null,
              name: "Ella A.",
            },
          },
        ],
        total: 3,
        possible_languages: ["en"],
      };

      render(
        <ItemReview
          revPos_lang={ReviewChildren.possible_languages}
          revArr={ReviewChildren.reviews}
          revTotal={ReviewChildren.total}
        />,
      );
      const imgElement = screen.getByRole("img");
      expect(screen.getByTestId("profile-url")).toBeInTheDocument();
      expect(screen.getByTestId("profile-url")).toHaveAttribute("href", "profileUrl");
      expect(imgElement).toHaveAttribute("src", "/img/nullUser.png");
      expect(imgElement).toHaveAttribute("alt", "user image url");
    });
  });
});

describe("ItemReview component test: ", () => {
  describe("test img element: src (null url) and alt field", () => {
    test("test profile-url element toBeInDocument: user.profile_url is not null", () => {
      const selectedBusinessUrl = "url";
      const ReviewChildren = {
        reviews: [
          {
            id: "xAG4O7l-t1ubbwVAlPnDKg",
            rating: 5,
            user: {
              id: "W8UK02IDdRS2GL_66fuq6w",
              profile_url: "profileUrl",
              name: "Ella A.",
            },
          },
        ],
        total: 3,
        possible_languages: [""],
      };

      const children = {
        selectedBusiness: { id: "", name: "" },
        reviewData: ReviewChildren,
      };

      render(
        <ItemReview
          url={selectedBusinessUrl}
          revPos_lang={ReviewChildren.possible_languages}
          revArr={ReviewChildren.reviews}
          revTotal={ReviewChildren.total}
        />,
      );

      const imgElement = screen.getByRole("img");
      expect(screen.getByTestId("profile-url")).toBeInTheDocument();
      expect(screen.getByTestId("profile-url")).toHaveAttribute("href", "profileUrl");
      expect(imgElement).toHaveAttribute("src", "/img/nullUser.png");
      expect(imgElement).toHaveAttribute("alt", "user image url");
    });
  });
});

describe("getLanguage function", () => {
  test("return available language<string> wiht a language code input", () => {
    expect(getLanguage("")).toEqual("");
  });
});
