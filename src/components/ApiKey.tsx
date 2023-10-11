import { useAtom } from "jotai";
import { apiKeyAtom } from "../lib/atoms";
import { useCallback, useEffect, useState } from "react";

export default function ApiKey() {
  const [apiKey, setApiKey] = useAtom(apiKeyAtom);
  const [draftApiKey, setDraftApiKey] = useState<string>("");
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pasteFromClipboard = useCallback(() => {
    navigator.clipboard.readText().then((text) => {
      setDraftApiKey(text);
    });
  }, [setDraftApiKey]);
  useEffect(() => {
    if (apiKey !== null) {
      setDraftApiKey(apiKey);
    }
  }, [setDraftApiKey, apiKey]);
  const onSubmit = useCallback(() => {
    (async () => {
      try {
        const res = await fetch("https://api.openai.com/v1/models", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${draftApiKey}`,
          },
        });
        if (res.status === 200) {
          setError(null);
          setApiKey(draftApiKey);
          setExpanded(false);
        } else {
          setError(`API Key is invalid: ${res.status}`);
        }
      } catch (e) {
        setError((e as Error).toString());
      }
    })();
  }, [setApiKey, draftApiKey]);
  return (
    <div className="shadow-md p-3 rounded-md inline-block">
      {apiKey === null || expanded ? (
        <div>
          <p>
            Get a secret key from{" "}
            <a
              className="underline"
              href="https://platform.openai.com/account/api-keys"
              target="_blank"
            >
              the OpenAI API Keys page
            </a>{" "}
            and paste it here (stored locally):
          </p>
          <div>
            <div className="flex items-center">
              <input
                id="api-key"
                className="h-8 px-2 border rounded"
                type="text"
                value={draftApiKey}
                placeholder="API Key"
                onChange={(e) => setDraftApiKey(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSubmit()}
              />
              <button
                className="button bg-slate-500 text-white rounded-md px-2 py-1 m-2"
                onClick={onSubmit}
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
              {error && <p className="text-red-500">{error}</p>}
            </div>
          </div>
        </div>
      ) : (
        <div onClick={() => setExpanded(true)}>API Key ✅</div>
      )}
    </div>
  );
}
