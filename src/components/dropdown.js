import React, {useEffect, useState} from 'react';
import Arrow from '../assets/images/angle_down.svg';

export default function Dropdown({options, disable, defaultOption, onClickOption}) {
  
  const [_title, setTitle] = useState(defaultOption.name)
  const [displayMenu, setDisplayMenu] = useState(false)

  const toggleDisplayMenu = () => setDisplayMenu((prevState) => !prevState)

  const setValue = (option) => {
    setTitle(option.name)
    onClickOption(option)
  }

  const reset = () => {
    setValue(defaultOption)
  }

  useEffect(() => {
    if(disable) {
      setDisplayMenu(false)
      reset()
    }
  }, [disable]) /* eslint-disable-line react-hooks/exhaustive-deps */

  let optionsElements = options.map(dropdownOption =>
      <div key={dropdownOption.val} className='option' onClick={() => {
        setValue(dropdownOption)
        toggleDisplayMenu()
      }}>{dropdownOption.name}</div>
  )

  return (
    <div className="select" style={{position: 'relative'}}
      onMouseLeave={() => setDisplayMenu(false)}
      >
      <div style={{position: 'absolute', top: '7px', right: '5px'}}><img src={Arrow} alt='select arrow' /></div>
      <div className="select-button"
        onClick={toggleDisplayMenu}
        onMouseEnter={() => setDisplayMenu(true)}
        > {_title} </div>

      {
        displayMenu ? (
        <div className='select-options'
          onMouseLeave={() => setDisplayMenu(false)}
          >
          {optionsElements}
        </div>)
        : null
      }
    </div>

  );
}
