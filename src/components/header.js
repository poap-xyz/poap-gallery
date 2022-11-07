import React from 'react';
import PoapLogo from '../assets/images/POAP.svg';
import { Link } from 'react-router-dom';

export const Header = () => {
  return (
    <header id="site-header" role="banner">
      <div className="container">
        <div className="pull-left">
          <Link to="/" className="logo">
            <img src={PoapLogo} alt="POAP" />
          </Link>
          <span>Gallery</span>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          {/* Ready for future links if needed */}
          {/* <Link to="#" className="link">FAQ</Link> */}
        </div>
      </div>
    </header>
  );
};
