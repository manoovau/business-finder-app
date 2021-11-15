import React, { useEffect, useState } from "react";
import { ItemInfoType, MarkerType } from "../interface";
import { BasicInfoProd, Pagination } from "./index";
import { Link } from "react-router-dom";

type Props = {
  resultYELPBus: ItemInfoType[];
  setIdSelected: (id: string) => void;
  setMarkerResArr: (arr: MarkerType[]) => void;
};

type pageInfoType = {
  currentPage: number;
  totalPage: number;
};

type itemsPageType = {
  min: number;
  max: number;
};

/**
 * Set the minimum and maximum index values for the items display by page, based on the current page and the items allowed by page
 * @param page current page
 * @param itemsByPage items allowed by page
 * @returns Object with min and max items per page value
 */
export const setMaxMinItemsPage = (page: number, itemsByPage: number): itemsPageType => {
  if (page === 1) return { min: 0, max: itemsByPage };
  return { min: (page - 1) * itemsByPage, max: page * itemsByPage };
};

/**
 * Calculate the amount of pages needed based on the total number of items and the number of item by page
 * @param totalItem total ampunt of item/s
 * @param itemByPage item/s allowed by page
 * @returns total amount of pages needed
 */
export function getTotalPages(totalItem: number, itemByPage: number): number {
  if (totalItem <= itemByPage) return 1;
  return (totalItem / itemByPage) % 1 === 0
    ? totalItem / itemByPage
    : Math.floor(totalItem / itemByPage) + 1;
}

export const ItemContainer = (props: Props): JSX.Element => {
  const { setIdSelected, setMarkerResArr } = props;

  const ITEMS_BY_PAGE = 10;
  const DEFAULT_NUMBER_VALUE = 0;
  const DEFAULT_CURRENT_PAGE = 1;

  const [pageInfo, setPageInfo] = useState<pageInfoType>({
    currentPage: DEFAULT_CURRENT_PAGE,
    totalPage: DEFAULT_NUMBER_VALUE,
  });
  const [itemsPage, setItemsPage] = useState<itemsPageType>({
    min: DEFAULT_NUMBER_VALUE,
    max: ITEMS_BY_PAGE,
  });

  let coordinatesResArr: MarkerType[] = [];

  useEffect(() => {
    if (props.resultYELPBus !== [])
      props.resultYELPBus.map((item: ItemInfoType, index: number) => {
        if (index >= itemsPage.min && index < itemsPage.max) {
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
  }, [itemsPage.min, props.resultYELPBus]);

  useEffect(() => {
    setPageInfo({
      ...pageInfo,
      currentPage: DEFAULT_CURRENT_PAGE,
      totalPage: getTotalPages(props.resultYELPBus.length, ITEMS_BY_PAGE),
    });
  }, [props.resultYELPBus]);

  useEffect(() => {
    const result = setMaxMinItemsPage(pageInfo.currentPage, ITEMS_BY_PAGE);
    setItemsPage({ ...itemsPage, min: result.min, max: result.max });
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
        {props.resultYELPBus.map((item: ItemInfoType, index: number) => {
          if (index >= itemsPage.min && index < itemsPage.max) {
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
