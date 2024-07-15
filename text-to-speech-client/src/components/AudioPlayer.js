import {createElement} from 'react';
import {useEffect, useRef} from "react";
export default function AudioPlayer({
  audioUrl,
  mimeType
}) {
  const audioPlayer = useRef(null);
  const audioSource = useRef(null);
  // Updates src when url changes
  useEffect(() => {
    if (audioPlayer.current && audioSource.current) {
      audioSource.current.src = audioUrl;
      audioPlayer.current.load();
    }
  }, [audioUrl]);
  return (
    createElement(
      "div",
      {
        className: 'flex relative z-10 my-4 w-full',
      },
      createElement(
        "audio",
        {
          ref: audioPlayer,
          controls: true,
          className: 'w-full h-14 rounded-lg bg-white shadow-xl shadow-black/5 ring-1 ring-slate-700/10',
        },
        createElement(
          "source",
          {
            ref: audioSource,
            type: mimeType,
          }
        ),
      ),
    )
  );
};
