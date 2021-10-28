import React from "react";
import { ApiResponseType, ItemInfoType } from "../interface";
import { BasicInfoProd } from "./index";
import { Link } from "react-router-dom";

type Props = {
  children: ApiResponseType;
  setIdSelected: (id: string) => void;
};

export const ItemContainer = (props: Props): JSX.Element => {
  const { children, setIdSelected } = props;
  return (
    <div id="item-result-container">
      {children?.businesses
        ? children.businesses.map((item: ItemInfoType, index: number) => {
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
          })
        : null}
    </div>
  );
};
