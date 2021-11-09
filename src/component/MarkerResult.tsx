import React from "react";
import { Marker, Popup } from "react-leaflet";
import Leaflet from "leaflet";
import markerMap from "../assets/markerMap.png";
import { MarkerType } from "../interface";
import { Link } from "react-router-dom";
import { createIconReview } from "../hooks/useReview";

type prop = {
  children: MarkerType;
  setIdSelected: (id: string) => void;
};

const IconLocation = Leaflet.icon({
  iconUrl: markerMap,
  iconRetinaUrl: markerMap,
  iconAnchor: undefined,
  shadowUrl: undefined,
  shadowSize: undefined,
  shadowAnchor: undefined,
  iconSize: [35, 35],
  className: "leaflet-venue-icon",
});

export const MarkerResult = (props: prop): JSX.Element => {
  const { children, setIdSelected } = props;
  return (
    <Marker position={[children.coord.latitude, children.coord.longitude]} icon={IconLocation}>
      <Popup>
        <Link
          id="marker"
          to={`/${children.idCoord}`}
          onClick={() => setIdSelected(children.idCoord)}
        >
          {children.nameCoord}
        </Link>
        <div className="rating">
          {children?.ratingCoord ? <div>{createIconReview(children.ratingCoord)}</div> : null}{" "}
          {children?.ratingCoord}
        </div>
        <div id="element-img">
          <img className="img-popup-container-item" src={children.imgCoord} />
        </div>
      </Popup>
    </Marker>
  );
};
