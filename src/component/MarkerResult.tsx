import React from "react";
import { Marker } from "react-leaflet";
import Leaflet from "leaflet";
import markerMap from "../assets/markerMap.png";
import { CenterType } from "../interface";

type prop = {
  children: CenterType;
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

export const MarkerResult = ({ children }: prop): JSX.Element => {
  return <Marker position={[children.latitude, children.longitude]} icon={IconLocation} />;
};
