import React from "react";
import { Marker, Popup } from "react-leaflet";
import Leaflet from "leaflet";
import markerMap from "../assets/markerMap.png";
import Pin from "../assets/pin.png";
import { Link } from "react-router-dom";
import { createIconReview } from "../hooks/useReview";

type prop = {
  lat: number;
  long: number;
  idCoord: string;
  name: string;
  rating?: number;
  img: string;
  markerType: string;
  setIdSelected: (id: string) => void;
};

export const MarkerResult = (props: prop): JSX.Element => {
  const { setIdSelected } = props;

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

  const CurrentLocation = Leaflet.icon({
    iconUrl: Pin,
    iconRetinaUrl: Pin,
    iconAnchor: undefined,
    shadowUrl: undefined,
    shadowSize: undefined,
    shadowAnchor: undefined,
    iconSize: [35, 35],
    className: "leaflet-venue-icon",
  });

  return (
    <Marker
      position={[props.lat, props.long]}
      icon={props.markerType === "result" ? IconLocation : CurrentLocation}
    >
      <Popup>
        <Link id="marker" to={`/${props.idCoord}`} onClick={() => setIdSelected(props.idCoord)}>
          {props.name}
        </Link>
        <div className="rating">
          {props?.rating ? <div>{createIconReview(props.rating)}</div> : null} {props?.rating}
        </div>
        <div id="element-img">
          <img className="img-popup-container-item" src={props.img} />
        </div>
      </Popup>
    </Marker>
  );
};
