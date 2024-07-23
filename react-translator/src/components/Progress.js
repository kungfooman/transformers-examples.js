import {createElement} from 'react';
function Progress({ text, percentage }) {
  percentage = percentage ?? 0;
  return (
    createElement(
      "div",
      {
        className: "progress-container",
      },
      createElement(
        "div",
        {
          className: 'progress-bar',
          style: {
            'width': `${percentage}%`
          },
        },
        text,
        " (",
        `${percentage.toFixed(2)}%`,
        ")",
      ),
    )
  );
}
export {Progress};
