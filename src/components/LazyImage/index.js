import React, { useState } from "react";
import './index.css'
import { PlaceHolderImage } from "../placeholderImage";
import { LazyLoadComponent } from 'react-lazy-load-image-component';

export const LazyImage = ({
  src,
  alt = "",
  width = "100%",
  height = "100%",
  containerStyles = {},
  containerClasses = ""
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <LazyLoadComponent>
      <div
        style={{
          width: width,
          height: height,
          ...containerStyles,
        }}
        className={`lazy-image-container ${containerClasses}`}
      >
        <img
          src={src}
          alt={alt}
          className="lazy-image"
          style={{
            position: isLoaded ? "relative" : "absolute",
            left: isLoaded ? "0" : "-100%",
          }}
          onLoad={() => setIsLoaded(true)}
        />
        {!isLoaded && <PlaceHolderImage width="100%" height="100%" />}
      </div>
    </LazyLoadComponent>
  );
};
