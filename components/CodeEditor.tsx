import { cn } from "@/lib/utils";
import flourite from "flourite";
import { codeSnippets, fonts } from "@/options";
import hljs from "highlight.js";
import { useEffect, useState } from "react";
import Editor from "react-simple-code-editor";
import { usePreferencesStore } from "@/store/use-preferences-store";

export default function CodeEditor() {
  const store = usePreferencesStore();
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side to prevent hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Add random code snippets on mount only once
  useEffect(() => {
    if (isClient && !store.code) {
      const randomSnippet =
        codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
      store.setCode(randomSnippet.code);
      store.setLanguage(randomSnippet.language);
    }
  }, [isClient, store.code, store.setCode, store.setLanguage]);

  // Auto Detect Language
  useEffect(() => {
    if (isClient && store.autoDetectLanguage && store.code) {
      // use flourite to detect language and provide highlighting
      const { language } = flourite(store.code, { noUnknown: true });
      store.setLanguage(language.toLowerCase() || "plaintext");
    }
  }, [isClient, store.autoDetectLanguage, store.code, store.setLanguage]);

  // Don't render until we're on the client side
  if (!isClient) {
    return (
      <div className="border-2 rounded-xl shadow-2xl bg-gray-100 animate-pulse">
        <div className="h-64 flex items-center justify-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "border-2 rounded-xl shadow-2xl",
        store.darkMode
          ? "bg-black/75 border-gray-600/40"
          : "bg-white/75 border-gray-200/20"
      )}
    >
      <header className="grid grid-cols-6 gap-3 items-center px-4 py-3">
        <div className="flex gap-1.5">
          <div className="rounded-full h-2 w-2 bg-red-500"></div>
          <div className="rounded-full h-2 w-2 bg-yellow-500"></div>
          <div className="rounded-full h-2 w-2 bg-green-500"></div>
        </div>
        <div className="col-span-4 flex justify-center">
          <input
            type="text"
            value={store.title}
            onChange={(e) => store.setTitle(e.target.value)}
            spellCheck={false}
            onClick={(e) => {
              if (e.target instanceof HTMLInputElement) {
                e.target.select();
              }
            }}
            className="bg-transparent text-center text-gray-400 text-sm font-medium focus:outline-none"
          />
        </div>
      </header>
      <div
        className={cn(
          "px-4 pb-4",
          store.darkMode
            ? "brightness-110"
            : "text-gray-800 brightness-50 saturate-200 contrast-200"
        )}
      >
        <Editor
          key={`editor-${store.language}-${store.fontStyle}`}
          value={store.code}
          onValueChange={(code) => store.setCode(code)}
          highlight={(code) =>
            hljs.highlight(code, { language: store.language || "plaintext" })
              .value
          }
          style={{
            fontFamily: fonts[store.fontStyle as keyof typeof fonts].name,
            fontSize: store.fontSize,
          }}
          textareaClassName="focus:outline-none"
          onClick={(e) => {
            if (e.target instanceof HTMLTextAreaElement) {
              e.target.select();
            }
          }}
        />
      </div>
    </div>
  );
}
