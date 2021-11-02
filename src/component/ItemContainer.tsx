import React, { useEffect, useState } from "react";
import { ApiResponseType, ItemInfoType, pageInfoType } from "../interface";
import { BasicInfoProd, Pagination } from "./index";
import { Link } from "react-router-dom";

type Props = {
  children: ApiResponseType;
  setIdSelected: (id: string) => void;
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
  const { children, setIdSelected } = props;

  const ITEMS_BY_PAGE = 10;
  const DEFAULT_NUMBER_VALUE = 0;
  const DEFAULT_CURRENT_PAGE = 1;
  const [arrayResult, setArrayResult] = useState<ApiResponseType>({
    businesses: [],
    region: {},
    total: DEFAULT_NUMBER_VALUE,
  });

  const [pageInfo, setPageInfo] = useState<pageInfoType>({
    currentPage: DEFAULT_CURRENT_PAGE,
    totalPage: DEFAULT_NUMBER_VALUE,
  });

  const [minItemsPage, setMInitemsPage] = useState<number>(DEFAULT_NUMBER_VALUE);
  const [maxItemsPage, setMaxItemsPage] = useState<number>(ITEMS_BY_PAGE);

  useEffect(() => {
    children.total > 50
      ? setArrayResult({
          ...arrayResult,
          businesses: children.businesses,
          region: children.region,
          total: 50,
        })
      : setArrayResult(children);

    setPageInfo({ ...pageInfo, currentPage: DEFAULT_CURRENT_PAGE });
  }, [children]);

  useEffect(
    () => setPageInfo({ ...pageInfo, totalPage: getTotalPages(arrayResult.total, ITEMS_BY_PAGE) }),
    [arrayResult],
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
    <div>
      <div id="item-result-container">
        {arrayResult?.businesses
          ? arrayResult.businesses.map((item: ItemInfoType, index: number) => {
              if (index >= minItemsPage && index < maxItemsPage) {
                return (
                  <Link
                    key={index}
                    id="element-container"
                    to={`/${item.id}`}
                    onClick={() => setIdSelected(item.id)}
                  >
                    <BasicInfoProd>{item}</BasicInfoProd>
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
            })
          : null}
      </div>
      <div>
        <Pagination incrementPage={incrementPage} decrementPage={decrementPage}>
          {pageInfo}
        </Pagination>
      </div>
    </div>
  );
};
