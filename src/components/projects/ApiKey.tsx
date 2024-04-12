import { useAtom } from "jotai";
import { apiKeyAtom } from "../../lib/atoms";
import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useToast } from "../ui/use-toast";

export default function ApiKey() {
  const [apiKey, setApiKey] = useAtom(apiKeyAtom);
  const [draftApiKey, setDraftApiKey] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
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
  const onSubmit = useCallback(async () => {
    setLoading(true);
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
        toast({ title: "API Key has been set" });
      } else {
        setError(`API Key is invalid: ${res.status}`);
        toast({
          title: "Could not use API key",
          description: `Error code ${res.status}`,
          variant: "destructive",
        });
      }
    } catch (e) {
      setError((e as Error).toString());
    }
    setLoading(false);
  }, [setApiKey, draftApiKey, toast]);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Set API Key</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-white">Set API Key</DialogTitle>
          <DialogDescription>
            <span className="text-slate-300">
              Get a secret key from{" "}
              <a
                className="underline"
                href="https://platform.openai.com/account/api-keys"
                target="_blank"
              >
                the OpenAI API Keys page
              </a>{" "}
              and paste it here. It is stored locally and never shared with us.
            </span>
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
              disabled={loading}
            >
              {loading ? "Verifying..." : "Done"}
            </Button>
          </div>
          <div>
            <button
              className="button underline text-slate-400"
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
