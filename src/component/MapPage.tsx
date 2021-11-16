import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { MarkerResult } from "./MarkerResult";
import { CenterType, MarkerType } from "../interface";

type prop = {
  markers?: MarkerType[];
  region?: CenterType;
  setIdSelected: (id: string) => void;
};

export const MapPage = (props: prop): JSX.Element => {
  const { setIdSelected } = props;
  const DEFAULT_VALUE = null;
  // leaflet resize issue
  window.dispatchEvent(new Event("resize"));

  return (
    <div id="map-container">
      {props?.region && props?.region?.latitude !== 0 && props?.region?.longitude !== 0 ? (
        <MapContainer
          id="map"
          center={[props.region.latitude, props.region.longitude]}
          zoom={window.screen.width > 600 ? 12 : 11}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />
          {props?.markers
            ? props.markers.map((item: MarkerType, index: number) => {
                return (
                  <MarkerResult
                    setIdSelected={setIdSelected}
                    key={`marker${index}`}
                    lat={item.coord.latitude}
                    long={item.coord.longitude}
                    idCoord={item.idCoord}
                    name={item.nameCoord}
                    rating={item.ratingCoord}
                    img={item.imgCoord}
                  />
                );
              })
            : DEFAULT_VALUE}
        </MapContainer>
      ) : (
        DEFAULT_VALUE
      )}
    </div>
  );
};
