import React, { useEffect, useState } from "react";
import { Marker, useMapEvents } from "react-leaflet";
import Leaflet from "leaflet";
import Pin from "../assets/pin.png";
import { CenterType } from "../interface";

type prop = {
  latitude: number;
  longitude: number;
  updateLocationClick: (location: CenterType) => void;
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
  const { updateLocationClick } = props;
  const [selectedPosition, setSelectedPosition] = useState<CenterType>({
    latitude: props.latitude,
    longitude: props.longitude,
  });

  useMapEvents({
    click(e: Leaflet.LeafletMouseEvent) {
      setSelectedPosition({ ...selectedPosition, latitude: e.latlng.lat, longitude: e.latlng.lng });
    },
  });

  useEffect(() => updateLocationClick(selectedPosition), [selectedPosition]);

  return (
    <Marker
      position={[selectedPosition.latitude, selectedPosition.longitude]}
      icon={IconLocation}
    />
  );
};
