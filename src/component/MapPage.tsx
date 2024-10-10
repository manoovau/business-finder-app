import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { MarkerResult, CurrentLocMarker } from "./index";
import { CenterType, MarkerType } from "../interface";

type prop = {
  markers?: MarkerType[];
  region?: CenterType;
  setIdSelected: (id: string) => void;
  updateLocationClick: (location: CenterType) => void;
};

export const MapPage = (props: prop): JSX.Element => {
  const { setIdSelected, updateLocationClick } = props;

  // leaflet resize issue
  window.dispatchEvent(new Event("resize"));

  return (
    <div id="map-container" className="text-center mr-8 m-5">
      {props?.region && props?.region?.latitude !== 0 && props?.region?.longitude !== 0 && (
        <MapContainer
          id="map"
          center={[props.region.latitude, props.region.longitude]}
          zoom={window.screen.width > 600 ? 12 : 11}
          className="h-[50vh] sm:h-screen"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />
          <CurrentLocMarker
            latitude={props.region.latitude}
            longitude={props.region.longitude}
            updateLocationClick={updateLocationClick}
          />
          {props?.markers &&
            props.markers.map((item: MarkerType, index: number) => {
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
                  markerType={"result"}
                />
              );
            })}
        </MapContainer>
      )}
    </div>
  );
};
