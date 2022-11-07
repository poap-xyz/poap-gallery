import React from 'react';
import classNames from 'classnames';
export const SubmitButton = ({ isSubmitting, canSubmit, text }) => (
  <button
    className={classNames('btn', isSubmitting && 'loading')}
    type="submit"
    disabled={isSubmitting || !canSubmit}
  >
    {isSubmitting ? '' : text}
  </button>
);
