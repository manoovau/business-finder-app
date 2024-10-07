import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { ItemMarker } from "./index";
import { CenterType } from "../interface";

type prop = {
  region: CenterType;
};

export const MapPageItem = (props: prop): JSX.Element => {
  // leaflet resize issue
  window.dispatchEvent(new Event("resize"));

  return (
    <MapContainer
      id="map-item"
      center={[props.region.latitude, props.region.longitude]}
      zoom={15}
      className="m-8 h-screen-25vh w-screen-50vw  sm:m-2 sm:h-screen-50vh sm:w-screen-33vw"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      <ItemMarker latitude={props.region.latitude} longitude={props.region.longitude} />
    </MapContainer>
  );
};
