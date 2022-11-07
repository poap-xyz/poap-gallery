import React, { useEffect, useRef, useState } from 'react';
import ReactTooltip from 'react-tooltip';

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
export const MultiLineEllipsis = ({ text = '', maxLengthPerLine }) => {
  const title1 = useRef(null);
  const title2 = useRef(null);
  const title3 = useRef(null);
  const title4 = useRef(null);
  const title5 = useRef(null);
  const secondLine = useRef(null);
  const [titleLength, setTitleLength] = useState(0);
  const [needsTooltip, setNeedsTooltip] = useState(false);

  useEffect(() => {
    let tests = [title1, title2, title3, title4, title5];
    let newTitleLength = undefined;
    tests.forEach((test) => {
      if (
        newTitleLength === undefined ||
        maxLengthPerLine === undefined ||
        test?.current?.offsetWidth <= maxLengthPerLine
      ) {
        newTitleLength = test.current.textContent.length;
      }
    });
    if (newTitleLength !== undefined) {
      setTitleLength(newTitleLength);
    }
  }, [maxLengthPerLine, needsTooltip, text.length]);
  useEffect(() => {
    if (secondLine.current.offsetWidth >= maxLengthPerLine !== needsTooltip) {
      setNeedsTooltip(secondLine.current.offsetWidth >= maxLengthPerLine);
    }
    // eslint-disable-next-line
  }, [secondLine.current?.offsetWidth, maxLengthPerLine, needsTooltip]);

  return (
    <div
      data-for={text}
      data-tip={text}
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      <span
        style={{
          width: 'fit-content',
          position: 'fixed',
          color: 'transparent',
          border: 'none',
          left: -1000,
          top: 0,
        }}
        ref={title5}
      >
        {text}
      </span>
      <span
        style={{
          width: 'fit-content',
          position: 'fixed',
          color: 'transparent',
          border: 'none',
          left: 32 - 1000,
          top: 0,
        }}
        ref={title4}
      >
        {text.substr(
          0,
          text
            .substr(
              0,
              maxLengthPerLine >= 400 ? 40 : maxLengthPerLine >= 300 ? 30 : 20
            )
            .lastIndexOf(' ')
        )}
      </span>
      <span
        style={{
          width: 'fit-content',
          position: 'fixed',
          color: 'transparent',
          border: 'none',
          left: 32 - 1000,
          top: 0,
        }}
        ref={title3}
      >
        {text.substr(
          0,
          text
            .substr(
              0,
              maxLengthPerLine >= 400 ? 35 : maxLengthPerLine >= 300 ? 25 : 15
            )
            .lastIndexOf(' ')
        )}
      </span>
      <span
        style={{
          width: 'fit-content',
          position: 'fixed',
          color: 'transparent',
          border: 'none',
          left: 32 - 1000,
          top: 0,
        }}
        ref={title2}
      >
        {text.substr(
          0,
          text
            .substr(
              0,
              maxLengthPerLine >= 400 ? 30 : maxLengthPerLine >= 300 ? 20 : 10
            )
            .lastIndexOf(' ')
        )}
      </span>
      <span
        style={{
          width: 'fit-content',
          position: 'fixed',
          color: 'transparent',
          border: 'none',
          left: 32 - 1000,
          top: 0,
        }}
        ref={title1}
      >
        {text.substr(
          0,
          text
            .substr(
              0,
              maxLengthPerLine >= 400 ? 20 : maxLengthPerLine >= 300 ? 10 : 5
            )
            .lastIndexOf(' ')
        )}
      </span>
      <span>{text.substr(0, titleLength)}</span>
      <span
        className="ellipsis"
        style={{
          width: 'fit-content',
          maxWidth: '100%',
          placeSelf: `${maxLengthPerLine >= 400 ? 'start' : 'center'}`,
        }}
        ref={secondLine}
      >
        {text.substr(titleLength)}
      </span>
      {needsTooltip && <ReactTooltip id={text} effect="solid" />}
    </div>
  );
};
