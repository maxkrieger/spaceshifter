import { useAtom } from "jotai";
import { apiKeyAtom } from "../lib/atoms";
import { useCallback, useState } from "react";

export default function ApiKey() {
  const [apiKey, setApiKey] = useAtom(apiKeyAtom);
  const [expanded, setExpanded] = useState(apiKey === null);
  const pasteFromClipboard = useCallback(() => {
    navigator.clipboard.readText().then((text) => {
      setApiKey(text);
    });
  }, [setApiKey]);
  return (
    <div className="shadow-md p-3 rounded-md inline-block">
      {expanded ? (
        <div>
          <p>
            Get a secret key from{" "}
            <a
              className="underline"
              href="https://platform.openai.com/account/api-keys"
              target="_blank"
            >
              this OpenAI page
            </a>{" "}
            and paste it here (stored locally):
          </p>
          <div>
            <div className="flex items-center">
              <input
                id="api-key"
                className="h-8 px-2 border rounded"
                type="text"
                value={apiKey ?? ""}
                placeholder="API Key"
                onChange={(e) => setApiKey(e.target.value)}
              />
              <button
                className="button bg-slate-500 text-white rounded-md px-2 py-1 m-2"
                onClick={() => setExpanded(false)}
              >
                Done
              </button>
            </div>
            <div>
              <button
                className="button underline text-slate-500"
                onClick={pasteFromClipboard}
              >
                paste from clipboard
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div onClick={() => setExpanded(true)}>API Key ✅</div>
      )}
    </div>
  );
}
