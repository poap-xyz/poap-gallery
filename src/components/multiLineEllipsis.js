import React, { useEffect, useRef, useState } from 'react';

/* 
 * Implementation is pretty shady but it works.
 * It basically generates a series of hidden test span elements,
 * gets their width, and uses the length of the text in the span
 * that gets closer to the maxLength.
 * All of that is needed because we are performing a manual word wrap.
 *
 * Lines' value is currently ignored. Could serve as a future way of
 *  indicating the amount of lines the text spans. Currently it spans
 *  two lines.
 */
export const MultiLineEllipsis = ({text='', lines, maxLength}) => {
  const title1 = useRef(null);
  const title2 = useRef(null);
  const title3 = useRef(null);
  const title4 = useRef(null);
  const title5 = useRef(null);
  const [titleLength, setTitleLength] = useState(0)
  const recalculateLength = (maxLength) => {
    let tests = [title1, title2, title3, title4, title5];
    let newTitleLength = 0;
    tests.forEach(test => {
      if (test?.current?.offsetWidth <= maxLength) {
        newTitleLength = test.current.textContent.length
      }
    })
    setTitleLength(newTitleLength)
  }
  useEffect(() => {
    recalculateLength(maxLength)
  }, [maxLength]);
  
  return (
    <div style={{display: 'flex', flexDirection: 'column'}}>
    <span style={{width: 'fit-content', zIndex: -1000, position: 'absolute', left: -1000}} ref={title5}>{text}</span>
    <span style={{width: 'fit-content', zIndex: -1000, position: 'absolute', left: -1000}} ref={title4}>{text.substr(0, text.substr(0,40).lastIndexOf(' '))}</span>
    <span style={{width: 'fit-content', zIndex: -1000, position: 'absolute', left: -1000}} ref={title3}>{text.substr(0, text.substr(0,35).lastIndexOf(' '))}</span>
    <span style={{width: 'fit-content', zIndex: -1000, position: 'absolute', left: -1000}} ref={title2}>{text.substr(0, text.substr(0,30).lastIndexOf(' '))}</span>
    <span style={{width: 'fit-content', zIndex: -1000, position: 'absolute', left: -1000}} ref={title1}>{text.substr(0, text.substr(0,20).lastIndexOf(' '))}</span>
    <span>{text.substr(0, titleLength)}</span>
    <span className='ellipsis'>{text.substr(titleLength)}</span>
    </div>
  )
}