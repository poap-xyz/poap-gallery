import React from 'react';
import PlantPink from '../assets/images/plant-pink.svg';
import PlantBlue from '../assets/images/plant-blue.svg';
import MiscLeft from '../assets/images/miscelaneous-left.svg';
import MiscRight from '../assets/images/miscelaneous-right.svg';

export function Foliage() {
  return (
    <div style={{ position: 'relative', zIndex: -1 }}>
      <img
        src={MiscLeft}
        alt="misc items"
        style={{ position: 'absolute', left: '0', top: '407px' }}
      />
      <img
        src={MiscRight}
        alt="misc items"
        style={{ position: 'absolute', right: '0', top: '454px' }}
      />
      <img
        src={PlantBlue}
        alt="blue plant"
        style={{ position: 'absolute', left: '0', top: '845px' }}
      />
      <img
        src={PlantPink}
        alt="pink plant"
        style={{ position: 'absolute', right: '0', top: '1311px' }}
      />
    </div>
  );
}
