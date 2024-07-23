import {useEffect, useRef, useState, createElement, Fragment} from 'react';
import {LanguageSelector                                    } from './components/LanguageSelector.js';
import {Progress                                            } from './components/Progress.js';
import {Worker                                              } from 'worker-with-import-map';
function App() {
  // Model loading
  const [ready, setReady] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [progressItems, setProgressItems] = useState([]);
  // Inputs and outputs
  const [input, setInput] = useState('I love walking my dog.');
  const [sourceLanguage, setSourceLanguage] = useState('eng_Latn');
  const [targetLanguage, setTargetLanguage] = useState('fra_Latn');
  const [output, setOutput] = useState('');
  // Create a reference to the worker object.
  const worker = useRef(null);
  // We use the `useEffect` hook to setup the worker as soon as the `App` component is mounted.
  useEffect(() => {
    if (!worker.current) {
      // Create the worker if it does not yet exist.
      worker.current = new Worker(new URL('./worker.js', import.meta.url), {
        type: 'module'
      });
    }

    // Create a callback function for messages from the worker thread.
    const onMessageReceived = (e) => {
      switch (e.data.status) {
        case 'initiate':
          // Model file start load: add a new progress item to the list.
          setReady(false);
          setProgressItems(prev => [...prev, e.data]);
          break;

        case 'progress':
          // Model file progress: update one of the progress items.
          setProgressItems(
            prev => prev.map(item => {
              if (item.file === e.data.file) {
                return { ...item, progress: e.data.progress }
              }
              return item;
            })
          );
          break;

        case 'done':
          // Model file loaded: remove the progress item from the list.
          setProgressItems(
            prev => prev.filter(item => item.file !== e.data.file)
          );
          break;

        case 'ready':
          // Pipeline ready: the worker is ready to accept messages.
          setReady(true);
          break;

        case 'update':
          // Generation update: update the output text.
          setOutput(e.data.output);
          break;

        case 'complete':
          // Generation complete: re-enable the "Translate" button
          setDisabled(false);
          break;
      }
    };

    // Attach the callback function as an event listener.
    worker.current.addEventListener('message', onMessageReceived);

    // Define a cleanup function for when the component is unmounted.
    return () => worker.current.removeEventListener('message', onMessageReceived);
  });

  const translate = () => {
    setDisabled(true);
    worker.current.postMessage({
      text: input,
      src_lang: sourceLanguage,
      tgt_lang: targetLanguage,
    });
  }

  return (
    createElement(
      Fragment,
      null,
      createElement(
        "h1",
        null,
        "Transformers.js",
      ),
      createElement(
        "h2",
        null,
        "ML-powered multilingual translation in React!",
      ),
      createElement(
        "div",
        {
          className: 'container',
        },
        createElement(
          "div",
          {
            className: 'language-container',
          },
          createElement(
            LanguageSelector,
            {
              type: "Source",
              defaultLanguage: "eng_Latn",
              onChange: (x) => {
                return setSourceLanguage(x.target.value);
              },
            }
          ),
          createElement(
            LanguageSelector,
            {
              type: "Target",
              defaultLanguage: "fra_Latn",
              onChange: (x) => {
                return setTargetLanguage(x.target.value);
              },
            }
          ),
        ),
        createElement(
          "div",
          {
            className: 'textbox-container',
          },
          createElement(
            "textarea",
            {
              value: input,
              rows: 3,
              onChange: (e) => {
                return setInput(e.target.value);
              },
            }
          ),
          createElement(
            "textarea",
            {
              value: output,
              rows: 3,
              readOnly: true,
            }
          ),
        ),
      ),
      createElement(
        "button",
        {
          disabled,
          onClick: translate,
        },
        "Translate",
      ),
      createElement(
        "div",
        {
          className: 'progress-bars-container',
        },
        ready === false && (
          createElement(
            "label",
            null,
            "Loading models... (only run once)",
          )
        ),
        progressItems.map((data) => {
          return (
            createElement(
              "div",
              {
                key: data.file,
              },
              createElement(
                Progress,
                {
                  text: data.file,
                  percentage: data.progress,
                }
              ),
            )
          );
        }),
      ),
    )
  );
}
export {App};
