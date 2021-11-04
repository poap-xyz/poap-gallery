import React, { useState } from "react";
import './index.css'
import { PlaceHolderImage } from "../placeholderImage";

export const LazyImage = ({
  src,
  alt = "",
  width,
  height,
  containerStyles,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      style={{
        width: width,
        height: height,
        objectFit: "cover",
        borderRadius: "50%",
        overflow: "hidden",
        position: "relative",
        ...containerStyles,
      }}
      className="lazyImageContainer"
    >
      <img
        src={src}
        alt={alt}
        className="lazyImage"
        style={{
          position: isLoaded ? "relative" : "absolute",
          left: isLoaded ? "0" : "-100%",
        }}
        onLoad={() => setIsLoaded(true)}
      />
      {!isLoaded && <PlaceHolderImage width={width} height={height} />}
    </div>
  );
};
