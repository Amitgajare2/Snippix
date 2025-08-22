"use client";

import { useEffect, useState } from "react";
import { useRef } from "react";
import { usePreferencesStore } from "@/store/use-preferences-store";
import { fonts } from "@/options";
import { themes } from "@/options";
import { cn } from "@/lib/utils";
import CodeEditor from "@/components/CodeEditor";
import WidthMeasurement from "@/components/WidthMeasurement";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Resizable } from "re-resizable";
import ThemeSelect from "@/components/controls/ThemeSelect";
import LanguageSelect from "@/components/controls/LanguageSelect";
import { ResetIcon } from "@radix-ui/react-icons";
import FontSelect from "@/components/controls/FontSelect";
import FontSizeInput from "@/components/controls/FontSizeInput";
import PaddingSlider from "@/components/controls/PaddingSlider";
import BackgroundSwitch from "@/components/controls/BackgroundSwitch";
import DarkModeSwitch from "@/components/controls/DarkModeSwitch";
import ExportOptions from "@/components/controls/ExportOptions";

function App() {
  const [width, setWidth] = useState("auto");
  const [showWidth, setShowWidth] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const store = usePreferencesStore();
  const theme = usePreferencesStore((state) => state.theme);
  const padding = usePreferencesStore((state) => state.padding);
  const fontStyle = usePreferencesStore((state) => state.fontStyle);
  const showBackground = usePreferencesStore((state) => state.showBackground);

  const editorRef = useRef(null);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.size === 0) return;
    
    const state = Object.fromEntries(queryParams);
    
    // Use the store's setter methods instead of direct setState
    if (state.code) {
      store.setCode(atob(state.code));
    }
    if (state.autoDetectLanguage !== undefined) {
      store.setAutoDetectLanguage(state.autoDetectLanguage === "true");
    }
    if (state.darkMode !== undefined) {
      store.setDarkMode(state.darkMode === "true");
    }
    if (state.fontSize) {
      store.setFontSize(Number(state.fontSize));
    }
    if (state.padding) {
      store.setPadding(Number(state.padding));
    }
    if (state.language) {
      store.setLanguage(state.language);
    }
    if (state.title) {
      store.setTitle(state.title);
    }
    if (state.theme) {
      store.setTheme(state.theme);
    }
    if (state.fontStyle) {
      store.setFontStyle(state.fontStyle);
    }
  }, [isClient, store]);

  // Don't render until we're on the client side
  if (!isClient) {
    return (
      <main className="dark min-h-screen flex flex-col gap-4 justify-center items-center bg-neutral-950 text-white p-4">
        <div className="animate-pulse">Loading...</div>
      </main>
    );
  }

  return (
    <main className="dark min-h-screen flex flex-col gap-4 justify-center items-center bg-neutral-950 text-white p-4">
      <link
        rel="stylesheet"
        href={themes[theme as keyof typeof themes].theme}
        crossOrigin="anonymous"
      />
      <link
        rel="stylesheet"
        href={fonts[fontStyle as keyof typeof fonts].src}
        crossOrigin="anonymous"
      />

      <div className="w-full overflow-auto flex grow items-center justify-center p-4 border rounded-xl border-b-gray-900">
        <Resizable
          enable={{ left: true, right: true }}
          minWidth={padding * 2 + 300}
          maxWidth="100%"
          size={{ width }}
          onResize={(e, dir, ref) => setWidth(ref.offsetWidth.toString())}
          onResizeStart={() => setShowWidth(true)}
          onResizeStop={() => setShowWidth(false)}
        >
          <div
            className={cn(
              "overflow-hidden mb-2 transition-all ease-out",
              showBackground
                ? themes[theme as keyof typeof themes].background
                : "ring ring-neutral-900"
            )}
            style={{ padding }}
            ref={editorRef}
          >
            <CodeEditor />
          </div>
          <WidthMeasurement showWidth={showWidth} width={Number(width)} />
          <div
            className={cn(
              "transition-opacity w-fit mx-auto -mt-4",
              showWidth || width === "auto"
                ? "invisible opacity-0 hidden"
                : "visible opacity-100"
            )}
          >
            <Button size="sm" onClick={() => setWidth("auto")} variant="ghost">
              <ResetIcon className="mr-2" />
              Reset width
            </Button>
          </div>
        </Resizable>
      </div>

      <Card className="p-6 w-fit bg-neutral-900/90 backdrop-blur">
        <CardContent className="flex flex-wrap gap-4 sm:gap-6 p-0">
          <ThemeSelect />
          <LanguageSelect />
          <FontSelect />
          <FontSizeInput />
          <PaddingSlider />
          <BackgroundSwitch />
          <DarkModeSwitch />
          <div className="w-px bg-neutral-800" />
          <div className="place-self-center">
            <ExportOptions
              targetRef={
                editorRef as unknown as React.RefObject<HTMLDivElement>
              }
            />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

export default App;
