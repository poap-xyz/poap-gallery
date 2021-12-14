import React from "react";
import { ReactComponent as Placeholder } from "../assets/images/placeholder.svg";

export const PlaceHolderImage = ({ width = 80, height = 80 }) => (
  <Placeholder width={width} height={height} />
)
