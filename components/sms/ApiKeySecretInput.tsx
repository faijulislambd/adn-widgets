"use client";
import React, { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const ApiKeySecretInput = () => {
  const [apiKey, setApiKey] = useState("");
  const [secret, setSecret] = useState("");

  // localStorage doesn't exist during server-side prerendering, so reading
  // it has to happen in an effect (client-only), not directly in the
  // component body or a useState initializer.
  useEffect(() => {
    const keySecretSet = JSON.parse(
      localStorage.getItem("apiKeySecretSet") || "{}",
    ) as { apiKey?: string; secret?: string };
    if (keySecretSet.apiKey) setApiKey(keySecretSet.apiKey);
    if (keySecretSet.secret) setSecret(keySecretSet.secret);
  }, []);

  const handelKeySecretSet = (key: string, secret: string) => {
    localStorage.setItem(
      "apiKeySecretSet",
      JSON.stringify({ apiKey: key, secret: secret }),
    );
    // You can also update the state here if needed
    setApiKey(key);
    setSecret(secret);
  };

  return (
    <div className="flex gap-4 flex-col md:flex-row items-center justify-start">
      <Input
        placeholder="API Key"
        type="text"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
      />
      <Input
        placeholder="Secret"
        type="password"
        value={secret}
        onChange={(e) => setSecret(e.target.value)}
      />
      <Button
        onClick={() =>
          apiKey && secret ? handelKeySecretSet(apiKey, secret) : null
        }
      >
        Set Api Key and Secret
      </Button>
    </div>
  );
};

export default ApiKeySecretInput;
