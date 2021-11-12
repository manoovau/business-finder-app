import React, { useEffect, useState } from "react";
import { ApiResponseType, ItemInfoType, MarkerType } from "../interface";
import { BasicInfoProd, Pagination } from "./index";
import { Link } from "react-router-dom";

type Props = {
  children: ApiResponseType;
  setIdSelected: (id: string) => void;
  setMarkerResArr: (arr: MarkerType[]) => void;
};

type pageInfoType = {
  currentPage: number;
  totalPage: number;
};

/**
 * Set the minimum and maximum index values for the items display by page, based on the current page and the items allowed by page
 * @param setMin minimum index for the array
 * @param setMax maximum index for the array
 * @param page current page
 * @param itemsByPage items allowed by page
 */
export const setMaxMinitemsPage = (
  setMin: (value: number) => void,
  setMax: (value: number) => void,
  page: number,
  itemsByPage: number,
): void => {
  if (page === 1) {
    setMin(0);
    setMax(itemsByPage);
  } else if (page !== 1) {
    setMin((page - 1) * itemsByPage);
    setMax(page * itemsByPage);
  }
};

/**
 * Calculate the amount of pages needed based on the total number of items and the number of item by page
 * @param totalItem total ampunt of item
 * @param itemByPage item allowed by page
 * @returns total amount of pages needed
 */
export function getTotalPages(totalItem: number, itemByPage: number): number {
  if (totalItem <= itemByPage) return 1;
  return (totalItem / itemByPage) % 1 === 0
    ? totalItem / itemByPage
    : Math.floor(totalItem / itemByPage) + 1;
}

export const ItemContainer = (props: Props): JSX.Element => {
  const { children, setIdSelected, setMarkerResArr } = props;

  const ITEMS_BY_PAGE = 10;
  const DEFAULT_NUMBER_VALUE = 0;
  const DEFAULT_CURRENT_PAGE = 1;
  const [result, setResult] = useState<ApiResponseType>({
    businesses: [],
    region: {
      center: {
        latitude: 50.5,
        longitude: 30.5,
      },
    },
    total: DEFAULT_NUMBER_VALUE,
  });

  const [pageInfo, setPageInfo] = useState<pageInfoType>({
    currentPage: DEFAULT_CURRENT_PAGE,
    totalPage: DEFAULT_NUMBER_VALUE,
  });

  const [minItemsPage, setMInitemsPage] = useState<number>(DEFAULT_NUMBER_VALUE);
  const [maxItemsPage, setMaxItemsPage] = useState<number>(ITEMS_BY_PAGE);
  let coordinatesResArr: MarkerType[] = [];

  useEffect(() => {
    if (result.businesses !== [])
      result.businesses.map((item: ItemInfoType, index: number) => {
        if (index >= minItemsPage && index < maxItemsPage) {
          let url = "";
          if (!item?.image_url) {
            url = `/img/nullPicture.png`;
          } else {
            url = item.image_url;
          }

          if (item?.coordinates)
            coordinatesResArr.push({
              coord: item.coordinates,
              idCoord: item.id,
              nameCoord: item.name,
              imgCoord: url,
              ratingCoord: item.rating,
            });
        }
      });

    setMarkerResArr([...coordinatesResArr]);
    coordinatesResArr = [];
  }, [minItemsPage, children, result]);

  useEffect(() => {
    children.total > 50
      ? setResult({
          ...result,
          businesses: children.businesses,
          region: children.region,
          total: 50,
        })
      : setResult(children);

    setPageInfo({ ...pageInfo, currentPage: DEFAULT_CURRENT_PAGE });
  }, [children]);

  useEffect(
    () => setPageInfo({ ...pageInfo, totalPage: getTotalPages(result.total, ITEMS_BY_PAGE) }),
    [result],
  );

  useEffect(() => {
    setMaxMinitemsPage(setMInitemsPage, setMaxItemsPage, pageInfo.currentPage, ITEMS_BY_PAGE);
  }, [pageInfo.currentPage]);

  const incrementPage = (): void => {
    setPageInfo({ ...pageInfo, currentPage: pageInfo.currentPage + 1 });
    window.scrollTo(0, 0);
  };

  const decrementPage = (): void => {
    setPageInfo({ ...pageInfo, currentPage: pageInfo.currentPage - 1 });
    window.scrollTo(0, 0);
  };

  return (
    <div id="item-pagin-result-container">
      <div id="item-result-container">
        {result?.businesses.map((item: ItemInfoType, index: number) => {
          if (index >= minItemsPage && index < maxItemsPage) {
            return (
              <Link
                key={index}
                id="element-container"
                to={`/${item.id}`}
                onClick={() => setIdSelected(item.id)}
              >
                <BasicInfoProd
                  name={item.name}
                  rating={item.rating}
                  review_count={item.review_count}
                  price={item.price}
                  categories={item.categories}
                  is_closed={item.is_closed}
                />
                <div id="element-img">
                  {!item.image_url ? (
                    <img className="img-res-container-item" src={`/img/nullPicture.png`} />
                  ) : (
                    <img className="img-res-container-item" src={item.image_url} />
                  )}
                </div>
              </Link>
            );
          }
        })}
      </div>
      <div>
        <Pagination
          incrementPage={incrementPage}
          decrementPage={decrementPage}
          currentPage={pageInfo.currentPage}
          totalPage={pageInfo.totalPage}
        />
      </div>
    </div>
  );
};
