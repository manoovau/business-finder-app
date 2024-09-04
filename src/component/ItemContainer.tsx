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
            <div id="element-img" className="mr-4">
              <img
                className="w-40 h-40 object-cover cursor-pointer"
                src={!item.image_url ? `/img/nullPicture.png` : item.image_url}
              />
            </div>
          </Link>
        );
      })}
    </div>
  );
};
