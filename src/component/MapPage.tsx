import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { MarkerResult } from "./MarkerResult";
import { MapPageChildrenType, MarkerType } from "../interface";

type prop = {
  children: MapPageChildrenType;
  setIdSelected: (id: string) => void;
};

export const MapPage = (props: prop): JSX.Element => {
  const { children, setIdSelected } = props;
  // leaflet resize issue
  window.dispatchEvent(new Event("resize"));

  return (
    <div id="map-container">
      {children?.region && children?.region?.latitude !== 0 && children?.region?.longitude !== 0 ? (
        <MapContainer
          id="map"
          center={[children.region.latitude, children.region.longitude]}
          zoom={window.screen.width > 600 ? 12 : 11}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />
          {children?.markers
            ? children.markers.map((item: MarkerType, index: number) => {
                return (
                  <MarkerResult setIdSelected={setIdSelected} key={index}>
                    {item}
                  </MarkerResult>
                );
              })
            : null}
        </MapContainer>
      ) : null}
    </div>
  );
};
