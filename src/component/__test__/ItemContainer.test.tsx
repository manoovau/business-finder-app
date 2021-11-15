import { setMaxMinItemsPage, getTotalPages } from "../ItemContainer";

describe("setMaxMinItemsPage function", () => {
  test("return min(20) and max(30) index when current page is 3 and items per page is 10 ", () => {
    expect(setMaxMinItemsPage(3, 10)).toEqual({ min: 20, max: 30 });
  });
});

describe("setMaxMinItemsPage function", () => {
  test("return min(1) and max(10)index when current page is 1 and items per page is 10 ", () => {
    expect(setMaxMinItemsPage(1, 10)).toEqual({ min: 0, max: 10 });
  });
});

describe("setMaxMinItemsPage function", () => {
  test("return min(40) and max(50)index when current page is 5 and items per page is 10 ", () => {
    expect(setMaxMinItemsPage(5, 10)).toEqual({ min: 40, max: 50 });
  });
});

describe("getTotalPages function", () => {
  test("return total pages(1) when total amount of items(4) and item by page(10)", () => {
    expect(getTotalPages(4, 10)).toEqual(1);
  });
});

describe("getTotalPages function", () => {
  test("return total pages(3) when total amount of items(25) and item by page(10)", () => {
    expect(getTotalPages(25, 10)).toEqual(3);
  });
});

describe("getTotalPages function", () => {
  test("return total pages(5) when total amount of items(50) and item by page(10)", () => {
    expect(getTotalPages(50, 10)).toEqual(5);
  });
});
