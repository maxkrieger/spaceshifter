import { useAtom } from "jotai";
import { apiKeyAtom } from "../lib/atoms";
import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export default function ApiKey() {
  const [apiKey, setApiKey] = useAtom(apiKeyAtom);
  const [draftApiKey, setDraftApiKey] = useState<string>("");
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
        } else {
          setError(`API Key is invalid: ${res.status}`);
        }
      } catch (e) {
        setError((e as Error).toString());
      }
    })();
  }, [setApiKey, draftApiKey]);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Set API Key</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-white">Set API Key</DialogTitle>
          <DialogDescription>
            Get a secret key from{" "}
            <a
              className="underline"
              href="https://platform.openai.com/account/api-keys"
              target="_blank"
            >
              the OpenAI API Keys page
            </a>{" "}
            and paste it here (stored locally):
          </DialogDescription>
        </DialogHeader>

        <div>
          <div className="flex items-center">
            <Input
              id="api-key"
              type="text"
              value={draftApiKey}
              placeholder="API Key"
              className="text-white"
              onChange={(e) => setDraftApiKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSubmit()}
            />
            <Button
              className="button text-white rounded-md px-2 py-1 m-2"
              onClick={onSubmit}
            >
              Done
            </Button>
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
      </DialogContent>
    </Dialog>
  );
}
