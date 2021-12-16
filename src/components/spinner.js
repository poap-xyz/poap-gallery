import React from 'react';
import LoadingImg from '../assets/animations/loading.svg';
export const Spinner = ({padding = '20px 0', imgWidth = 38}) => (
  <div className="loading-content" style={{padding: padding}}>
    <img src={LoadingImg} alt="" style={{maxWidth: imgWidth}} />
  </div>
);
