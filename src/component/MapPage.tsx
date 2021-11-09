import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { MarkerResult } from "./MarkerResult";
import { MapPageChildrenType, CenterType } from "../interface";

type prop = {
  children: MapPageChildrenType;
};

export const MapPage = ({ children }: prop): JSX.Element => {
  return (
    <div id="map-container">
      {children?.region && children?.region?.latitude !== 0 && children?.region?.longitude !== 0 ? (
        <MapContainer center={[children.region.latitude, children.region.longitude]} zoom={13}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />
          {children?.markers
            ? children.markers.map((item: CenterType, index: number) => {
                return <MarkerResult key={index}>{item}</MarkerResult>;
              })
            : null}
        </MapContainer>
      ) : null}
    </div>
  );
};
