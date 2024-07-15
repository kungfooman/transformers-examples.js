import {createElement} from 'react';
export default function Progress({
  text,
  percentage
}) {
  percentage ??= 0;
  return (
    createElement(
      "div",
      {
        className: "relative text-black bg-white rounded-lg text-left overflow-hidden",
      },
      createElement(
        "div",
        {
          className: 'px-2 w-[1%] h-full bg-blue-500 whitespace-nowrap',
          style: {
            width: `${percentage}%`
          },
        },
        text,
        " (",
        `${percentage.toFixed(2)}%`,
        ")",
      ),
    )
  );
};
