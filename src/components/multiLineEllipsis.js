import React, { useEffect, useRef, useState } from 'react';

/* 
 * Implementation is pretty shady but it works.
 * It basically generates a series of hidden test span elements,
 * gets their width, and uses the length of the text in the span
 * that gets closer to the maxLengthPerLine.
 * All of that is needed because we are performing a manual word wrap.
 *
 * linesAmount's value is currently ignored. Could serve as a future way of
 *  indicating the amount of lines the text spans. Currently it spans
 *  two lines.
 */
export const MultiLineEllipsis = ({text='', linesAmount, maxLengthPerLine}) => {
  const title1 = useRef(null);
  const title2 = useRef(null);
  const title3 = useRef(null);
  const title4 = useRef(null);
  const title5 = useRef(null);
  const [titleLength, setTitleLength] = useState(0)
  const recalculateLength = (maxLengthPerLine) => {
    let tests = [title1, title2, title3, title4, title5];
    let newTitleLength = undefined;
    tests.forEach(test => {
      if (newTitleLength===undefined || maxLengthPerLine===undefined || test?.current?.offsetWidth <= maxLengthPerLine) {
        newTitleLength = test.current.textContent.length
      }
    })
    if (newTitleLength !== undefined) {
      setTitleLength(newTitleLength)
    }
  }

  useEffect(() => {
    recalculateLength(maxLengthPerLine)
  }, [maxLengthPerLine]);
  
  return (
    <div style={{display: 'flex', flexDirection: 'column'}}>
    <span style={{width: 'fit-content', position: 'absolute', color: 'red', border: '1px solid red', left: 32+-1000, top: 200}} ref={title5}>
      {text}</span>
    <span style={{width: 'fit-content', position: 'absolute', color: 'red', border: '1px solid red', left: 32+-1000, top: 150}} ref={title4}>
      {text.substr(0, text.substr(0,(maxLengthPerLine>=400 ? 40 : maxLengthPerLine>=300 ? 30 : 20)).lastIndexOf(' '))}</span>
    <span style={{width: 'fit-content', position: 'absolute', color: 'red', border: '1px solid red', left: 32+-1000, top: 100}} ref={title3}>
      {text.substr(0, text.substr(0,(maxLengthPerLine>=400 ? 35 : maxLengthPerLine>=300 ? 25 : 15)).lastIndexOf(' '))}</span>
    <span style={{width: 'fit-content', position: 'absolute', color: 'red', border: '1px solid red', left: 32+-1000, top: 50}} ref={title2}>
      {text.substr(0, text.substr(0,(maxLengthPerLine>=400 ? 30 : maxLengthPerLine>=300 ? 20 : 10)).lastIndexOf(' '))}</span>
    <span style={{width: 'fit-content', position: 'absolute', color: 'red', border: '1px solid red', left: 32+-1000, top: 0}} ref={title1}>
      {text.substr(0, text.substr(0,(maxLengthPerLine>=400 ? 20 : maxLengthPerLine>=300 ? 10 : 5)).lastIndexOf(' '))}</span>
    <span>{text.substr(0, titleLength)}</span>
    <span className='ellipsis'>{text.substr(titleLength)}</span>
    </div>
  )
}