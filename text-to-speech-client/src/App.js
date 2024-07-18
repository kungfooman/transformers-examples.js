import React, {useState, useEffect, useRef} from 'react';
import AudioPlayer from './components/AudioPlayer.js';
import Progress from './components/Progress.js';
import {createElement            } from 'react';
import {SPEAKERS, DEFAULT_SPEAKER} from './constants.js';
import {
  WorkerWithImportMapViaBedfordsShim,
  WorkerWithImportMapViaInlineFrame, // Works, but no caching
} from 'worker-with-import-map';
const url = new URL('./worker.js', import.meta.url);
//const url = './worker.real.js'; // @todo Should work too.
const workerWithImportmap = new WorkerWithImportMapViaBedfordsShim(url , {type: 'module', importMap: 'inherit'});
window.workerWithImportmap = workerWithImportmap;
const App = () => {
  // Model loading
  const [ready, setReady] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [progressItems, setProgressItems] = useState([]);
  // Inputs and outputs
  const [text, setText] = useState('I love Hugging Face!');
  const [selectedSpeaker, setSelectedSpeaker] = useState(DEFAULT_SPEAKER);
  const [output, setOutput] = useState(null);
  // Create a reference to the worker object.
  const worker = useRef(null);
  // We use the `useEffect` hook to setup the worker as soon as the `App` component is mounted.
  useEffect(() => {
    if (!worker.current) {
      // Create the worker if it does not yet exist.
      //worker.current = new Worker(url, {type: 'module'});
      worker.current = workerWithImportmap;
    }
    // Create a callback function for messages from the worker thread.
    const onMessageReceived = (e) => {
      switch (e.data.status) {
        case 'initiate':
          // Model file start load: add a new progress item to the list.
          setReady(false);
          setProgressItems((prev) => [...prev, e.data]);
          break;
        case 'progress':
          // Model file progress: update one of the progress items.
          setProgressItems((prev) => prev.map((item) => {
            if (item.file === e.data.file) {
              return {
                ...item,
                progress: e.data.progress
              };
            }
            return item;
          }));
          break;
        case 'done':
          // Model file loaded: remove the progress item from the list.
          setProgressItems((prev) => prev.filter((item) => item.file !== e.data.file));
          break;
          case 'ready':
          // Pipeline ready: the worker is ready to accept messages.
          setReady(true);
          break;
        case 'complete':
          // Generation complete: re-enable the "Translate" button
          setDisabled(false);
          const blobUrl = URL.createObjectURL(e.data.output);
          setOutput(blobUrl);
          break;
      }
    };
    // Attach the callback function as an event listener.
    worker.current.addEventListener('message', onMessageReceived);
    // Define a cleanup function for when the component is unmounted.
    return () => worker.current.removeEventListener('message', onMessageReceived);
  });
  const handleGenerateSpeech = () => {
    setDisabled(true);
    worker.current.postMessage({
      text,
      speaker_id: selectedSpeaker,
    });
  };
  const isLoading = ready === false;
  return (
    createElement(
      "div",
      {
        className: 'min-h-screen flex items-center justify-center bg-gray-100 h-screen',
      },
      createElement(
        "div",
        {
          className: 'absolute gap-1 z-50 top-0 left-0 w-full h-full transition-all px-8 flex flex-col justify-center text-center',
          style: {
            opacity: isLoading ? 1 : 0,
            pointerEvents: isLoading ? 'all' : 'none',
            background: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(8px)',
          },
        },
        isLoading && (
          createElement(
            "label",
            {
              className: 'text-white text-xl p-3',
            },
            "Loading models... (only run once)",
          )
        ),
        progressItems.map((data) => (
          createElement(
            "div",
            {
              key: `${data.name}/${data.file}`,
            },
            createElement(
              Progress,
              {
                text: `${data.name}/${data.file}`,
                percentage: data.progress,
              }
            ),
          )
        )),
      ),
      createElement(
        "div",
        {
          className: 'bg-white p-8 rounded-lg shadow-lg w-full max-w-xl m-2',
        },
        createElement(
          "h1",
          {
            className: 'text-3xl font-semibold text-gray-800 mb-1 text-center',
          },
          "In-browser Text to Speech",
        ),
        createElement(
          "h2",
          {
            className: 'text-base font-medium text-gray-700 mb-2 text-center',
          },
          "Made with ",
          createElement(
            "a",
            {
              href: 'https://huggingface.co/docs/transformers.js',
            },
            "🤗 Transformers.js",
          ),
        ),
        createElement(
          "div",
          {
            className: 'mb-4',
          },
          createElement(
            "label",
            {
              htmlFor: 'text',
              className: 'block text-sm font-medium text-gray-600',
            },
            "Text",
          ),
          createElement(
            "textarea",
            {
              id: 'text',
              className: 'border border-gray-300 rounded-md p-2 w-full',
              rows: '4',
              placeholder: 'Enter text here',
              value: text,
              onChange: (e) => setText(e.target.value),
            }
          ),
        ),
        createElement(
          "div",
          {
            className: 'mb-4',
          },
          createElement(
            "label",
            {
              htmlFor: 'speaker',
              className: 'block text-sm font-medium text-gray-600',
            },
            "Speaker",
          ),
          createElement(
            "select",
            {
              id: 'speaker',
              className: 'border border-gray-300 rounded-md p-2 w-full',
              value: selectedSpeaker,
              onChange: (e) => setSelectedSpeaker(e.target.value),
            },
            Object.entries(SPEAKERS).map(([key, value]) => (
              createElement(
                "option",
                {
                  key,
                  value,
                },
                key,
              )
            )),
          ),
        ),
        createElement(
          "div",
          {
            className: 'flex justify-center',
          },
          createElement(
            "button",
            {
              className: `${disabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded-md py-2 px-4`,
              onClick: handleGenerateSpeech,
              disabled,
            },
            disabled ? 'Generating...' : 'Generate',
          ),
        ),
        output && createElement(
          AudioPlayer,
          {
            audioUrl: output,
            mimeType: 'audio/wav',
          }
        ),
      ),
    )
  );
};
export default App;
