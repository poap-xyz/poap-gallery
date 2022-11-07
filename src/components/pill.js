import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import ReactTooltip from 'react-tooltip';

export function Pill({
  text = null,
  tooltip = false,
  icon = null,
  className = '',
  style = {},
}) {
  return (
    <>
      <div
        className={`pill ${className}`}
        style={style}
        data-tip={tooltip ? text : null}
      >
        <span className={`${className.includes('ellipsis') ? 'ellipsis' : ''}`}>
          {icon && (
            <FontAwesomeIcon
              style={{ width: '1rem', marginRight: '.2rem' }}
              icon={icon}
            />
          )}
          {text}
        </span>
      </div>
      {tooltip && text && <ReactTooltip effect="solid" />}
    </>
  );
}
