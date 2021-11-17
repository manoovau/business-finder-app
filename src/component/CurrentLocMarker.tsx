import React from "react";
import { Marker } from "react-leaflet";
import Leaflet from "leaflet";
import Pin from "../assets/pin.png";

type prop = {
  lat: number;
  long: number;
};

const IconLocation = Leaflet.icon({
  iconUrl: Pin,
  iconRetinaUrl: Pin,
  iconAnchor: undefined,
  shadowUrl: undefined,
  shadowSize: undefined,
  shadowAnchor: undefined,
  iconSize: [45, 45],
  className: "leaflet-venue-icon",
});

export const CurrentLocMarker = (props: prop): JSX.Element => {
  return <Marker position={[props.lat, props.long]} icon={IconLocation} />;
};
