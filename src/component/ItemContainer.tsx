import React from "react";
import { ItemInfoType } from "../interface";
import { BasicInfoProd } from "./index";
import { Link } from "react-router-dom";

type Props = {
  resultYELPBus: ItemInfoType[];
  setIdSelected: (id: string) => void;
};

export const ItemContainer = (props: Props): JSX.Element => {
  const { setIdSelected } = props;

  return (
    <div id="item-result-container">
      {props.resultYELPBus.map((item: ItemInfoType) => {
        return (
          <Link
            key={item.id}
            id="element-container"
            className="m-5 p-5 mb-2 flex flex-row-reverse justify-between bg-gray-50"
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
            <div id="element-img" className="w-24 h-24 sm:w-48 sm:h-32">
              <img
                className=" cursor-pointer h-full w-full object-cover"
                src={!item.image_url ? `/img/nullPicture.png` : item.image_url}
              />
            </div>
          </Link>
        );
      })}
    </div>
  );
};
