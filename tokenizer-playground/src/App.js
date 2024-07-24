import {useCallback, useEffect, useRef, useState, createElement} from 'react';
import {Token } from './components/Token.js';
import {Worker} from 'rti-worker';
// Define list of tokenizers and their corresponding human-readable names
const TOKENIZER_OPTIONS = Object.freeze({
  'Xenova/gpt-4': 'gpt-4 / gpt-3.5-turbo / text-embedding-ada-002',
  'Xenova/text-davinci-003': 'text-davinci-003 / text-davinci-002',
  'Xenova/gpt-3': 'gpt-3',
  'Xenova/grok-1-tokenizer': 'Grok-1',
  'Xenova/claude-tokenizer': 'Claude',
  'Xenova/mistral-tokenizer-v3': 'Mistral v3',
  'Xenova/mistral-tokenizer-v1': 'Mistral v1',
  'Xenova/gemma-tokenizer': 'Gemma',
  'Xenova/llama-3-tokenizer': 'Llama 3',
  'Xenova/llama-tokenizer': 'LLaMA / Llama 2',
  'Xenova/c4ai-command-r-v01-tokenizer': 'Cohere Command-R',
  'Xenova/t5-small': 'T5',
  'Xenova/bert-base-cased': 'bert-base-cased',
  '': 'Custom',
});
function App() {
  // Allow user to set tokenizer and text via URL query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const tokenizerParam = urlParams.get('tokenizer');
  const textParam = urlParams.get('text');

  const [tokenIds, setTokenIds] = useState([])
  const [decodedTokens, setDecodedTokens] = useState([])
  const [margins, setMargins] = useState([])
  const [outputOption, setOutputOption] = useState('text');
  const [tokenizer, setTokenizer] = useState(tokenizerParam ?? 'Xenova/gpt-4');
  const [customTokenizer, setCustomTokenizer] = useState('');

  const textareaRef = useRef(null);
  const outputRef = useRef(null);

  // Create a reference to the worker object.
  const worker = useRef(null);

  // We use the `useEffect` hook to set up the worker as soon as the `App` component is mounted.
  useEffect(() => {
    if (!worker.current) {
      // Create the worker if it does not yet exist.
      worker.current = new Worker(new URL('./worker.js', import.meta.url), {
        type: 'module'
      });
    }

    // Create a callback function for messages from the worker thread.
    const onMessageReceived = (e) => {
      setTokenIds(e.data.token_ids)
      setDecodedTokens(e.data.decoded)
      setMargins(e.data.margins)
    };

    // Attach the callback function as an event listener.
    worker.current.addEventListener('message', onMessageReceived);

    // Define a cleanup function for when the component is unmounted.
    return () => worker.current.removeEventListener('message', onMessageReceived);
  }, []);

  const resetOutput = useCallback(() => {
    setOutputOption('text');
    setTokenIds([]);
    setDecodedTokens([]);
    setMargins([]);
  }, []);

  const onInputChange = useCallback((e) => {
    const model_id = tokenizer;
    const text = e.target.value;

    if (text.length > 10000) {
      setOutputOption(null);
      console.log('User most likely pasted in a large body of text (> 10k chars), so we hide the output (until specifically requested by the user).')
    }
    worker.current.postMessage({ model_id, text });
  }, [tokenizer]);

  useEffect(() => {
    if (textParam) {
      onInputChange({ target: { value: textParam } });
    }
  }, [onInputChange, textParam]);

  const onTokenizerChange = useCallback((e) => {
    const model_id = e.target.value;
    setTokenizer(model_id);
    if (!model_id) return;
    worker.current.postMessage({ model_id, text: textareaRef.current.value });
  }, []);

  return (
    createElement(
      "div",
      {
        className: 'w-full max-w-[720px] flex flex-col gap-4 items-center',
      },
      createElement(
        "div",
        null,
        createElement(
          "h1",
          {
            className: 'text-5xl font-bold mb-2',
          },
          "The Tokenizer Playground",
        ),
        createElement(
          "h2",
          {
            className: 'text-lg font-normal',
          },
          "Experiment with different tokenizers (running ",
          createElement(
            "a",
            {
              className: "text-gray-900 underline",
              href: "https://github.com/xenova/transformers.js",
            },
            "locally",
          ),
          " in your browser).",
        ),
      ),
      createElement(
        "div",
        null,
        createElement(
          "select",
          {
            value: (tokenizer in TOKENIZER_OPTIONS && !customTokenizer) ? tokenizer : '',
            onChange: (e) => {
              resetOutput();
              setCustomTokenizer('');
              onTokenizerChange(e);
            },
            className: "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2",
          },
          Object.entries(TOKENIZER_OPTIONS).map(([value, label]) => {
            return (
              createElement(
                "option",
                {
                  key: value,
                  value,
                },
                label,
              )
            );
          }),
        ),
        (!(tokenizer in TOKENIZER_OPTIONS) || customTokenizer || tokenizer === '') && (
          createElement(
            "input",
            {
              type: "text",
              placeholder: "Custom tokenizer",
              defaultValue: customTokenizer || tokenizer,
              onChange: (e) => {
                setCustomTokenizer(e.target.value);
                onTokenizerChange(e);
              },
              className: "bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full py-1 px-2 mt-1",
            }
          )
        ),
      ),
      createElement(
        "textarea",
        {
          ref: textareaRef,
          onChange: onInputChange,
          rows: "8",
          className: "font-mono text-lg block w-full p-2.5 text-gray-900 bg-gray-50 rounded-lg border border-gray-200",
          placeholder: "Enter some text",
          defaultValue: textParam ?? textareaRef.current?.value ?? '',
        }
      ),
      createElement(
        "div",
        {
          className: 'flex justify-center gap-5',
        },
        createElement(
          "div",
          {
            className: 'flex flex-col',
          },
          createElement(
            "h2",
            {
              className: 'font-semibold uppercase leading-4',
            },
            "Tokens",
          ),
          createElement(
            "h3",
            {
              className: 'font-semibold text-3xl',
            },
            tokenIds.length.toLocaleString(),
          ),
        ),
        createElement(
          "div",
          {
            className: 'flex flex-col',
          },
          createElement(
            "h2",
            {
              className: 'font-semibold uppercase leading-4',
            },
            "Characters",
          ),
          createElement(
            "h3",
            {
              className: 'font-semibold text-3xl',
            },
            (textareaRef.current?.value.length ?? 0).toLocaleString(),
          ),
        ),
      ),
      createElement(
        "div",
        {
          ref: outputRef,
          className: 'font-mono text-lg p-2.5 w-full bg-gray-100 rounded-lg border border-gray-200 whitespace-pre-wrap text-left h-[200px] overflow-y-auto',
        },
        outputOption === 'text' ? (
          decodedTokens.map((token, index) => {
            return createElement(
              Token,
              {
                key: index,
                text: token,
                position: index,
                margin: margins[index],
              }
            );
          })
        ) : outputOption === 'token_ids' ? (
          `[${tokenIds.join(', ')}]`
        ) : null,
      ),
      createElement(
        "div",
        {
          className: "flex items-center gap-2 self-end",
        },
        createElement(
          "div",
          {
            className: "flex items-center",
          },
          createElement(
            "input",
            {
              checked: outputOption === 'text',
              onChange: () => {
                return setOutputOption('text');
              },
              id: "output-radio-1",
              type: "radio",
              value: "",
              name: "output-radio",
              className: "w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500",
            }
          ),
          createElement(
            "label",
            {
              htmlFor: "output-radio-1",
              className: "ml-1 text-sm font-medium text-gray-900 dark:text-gray-300",
            },
            "Text",
          ),
        ),
        createElement(
          "div",
          {
            className: "flex items-center",
          },
          createElement(
            "input",
            {
              checked: outputOption === 'token_ids',
              onChange: () => {
                return setOutputOption('token_ids');
              },
              id: "output-radio-2",
              type: "radio",
              value: "",
              name: "output-radio",
              className: "w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500",
            }
          ),
          createElement(
            "label",
            {
              htmlFor: "output-radio-2",
              className: "ml-1 text-sm font-medium text-gray-900 dark:text-gray-300",
            },
            "Token IDs",
          ),
        ),
        createElement(
          "div",
          {
            className: "flex items-center",
          },
          createElement(
            "input",
            {
              checked: outputOption === null,
              onChange: () => {
                return setOutputOption(null);
              },
              id: "output-radio-3",
              type: "radio",
              value: "",
              name: "output-radio",
              className: "w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500",
            }
          ),
          createElement(
            "label",
            {
              htmlFor: "output-radio-3",
              className: "ml-1 text-sm font-medium text-gray-900 dark:text-gray-300",
            },
            "Hide",
          ),
        ),
      ),
    )
  );
}
export {App};
