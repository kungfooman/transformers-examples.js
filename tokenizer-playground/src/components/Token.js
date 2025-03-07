import {createElement, Fragment} from 'react';
const COLOURS = [
  'bg-purple-300',
  'bg-green-300',
  'bg-yellow-300',
  'bg-red-300',
  'bg-blue-300',
];
function Token({
  text,
  position,
  margin
}) {
  const textWithLineBreaks = text.split('\n').map((line, index, array) => {
    return (
      createElement(
        Fragment,
        {
          key: index,
        },
        line,
        index !== array.length - 1 && createElement(
          "br",
          null
        ),
      )
    );
  });
  return (
    createElement(
      "span",
      {
        style: {
          marginLeft: margin
        },
        className: `leading-5 ${textWithLineBreaks.length === 1 ? 'inline-block ' : ''}${COLOURS[position % COLOURS.length]}`,
      },
      textWithLineBreaks,
    )
  );
}
export {Token};
