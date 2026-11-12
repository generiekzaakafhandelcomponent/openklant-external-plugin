import React, {useCallback, useEffect, useState} from "react";
import {createRoot} from "react-dom/client";
import {ValtimoPluginSDK} from "@valtimo/plugin-sdk/frontend";

const sdk = new ValtimoPluginSDK();

// Apply theme to document root
function applyTheme(theme: string | null) {
  const root = document.documentElement;
  if (theme && theme !== "white") {
    root.setAttribute("data-carbon-theme", theme);
  } else {
    root.removeAttribute("data-carbon-theme");
  }
}

const TooltipIcon = () => (
  <svg className="tooltip" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.07,11.25L14.17,12.17C13.45,12.89 13,13.5 13,15H11V14.5C11,13.39 11.45,12.39 12.17,11.67L13.41,10.41C13.78,10.05 14,9.55 14,9C14,7.89 13.1,7 12,7A2,2 0 0,0 10,9H8A4,4 0 0,1 12,5A4,4 0 0,1 16,9C16,9.88 15.64,10.68 15.07,11.25M13,19H11V17H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12C22,6.47 17.5,2 12,2Z"/>
  </svg>
);

function ConfigForm() {
  const [title, setTitle] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [apiToken, setApiToken] = useState("");

  useEffect(() => {
    // Apply initial theme
    applyTheme(sdk.getTheme());

    // Listen for theme changes
    sdk.onThemeChanged((theme) => applyTheme(theme));

    sdk.onPrefillConfiguration(({title: prefillTitle, configuration}) => {
      if (prefillTitle) setTitle(prefillTitle);
      if (configuration.baseUrl) setBaseUrl(configuration.baseUrl as string);
    });
    sdk.onSave(() => {});
    sdk.emit("ready", {});

    // Force height update after render settles
    setTimeout(() => {
      const height = document.documentElement.scrollHeight;
      sdk.emit("resize", { height });
    }, 100);
  }, []);

  const emit = useCallback((nextTitle: string, nextBaseUrl: string, nextApiToken: string) => {
    const valid = nextTitle.trim().length > 0 && nextBaseUrl.trim().length > 0 && nextApiToken.trim().length > 0;
    const config: Record<string, string> = {
      baseUrl: nextBaseUrl.trim(),
    };
    if (nextApiToken.trim().length > 0) {
      config.apiToken = nextApiToken.trim();
    }
    sdk.setConfiguration(valid, nextTitle.trim(), config);
  }, []);

  return (
    <div className="cds--form">
      <div className="cds--form-item">
        <label htmlFor="title" className="cds--label">
          {sdk.t("config.title.label")} <span className="required">(vereist)</span> <TooltipIcon />
        </label>
        <input
          id="title"
          type="text"
          className="cds--text-input"
          value={title}
          onChange={(e) => { setTitle(e.target.value); emit(e.target.value, baseUrl, apiToken); }}
          placeholder={sdk.t("config.title.placeholder")}
        />
      </div>

      <div className="cds--form-item">
        <label htmlFor="baseUrl" className="cds--label">
          {sdk.t("config.baseUrl.label")} <span className="required">(vereist)</span> <TooltipIcon />
        </label>
        <input
          id="baseUrl"
          type="url"
          className="cds--text-input"
          value={baseUrl}
          onChange={(e) => { setBaseUrl(e.target.value); emit(title, e.target.value, apiToken); }}
          placeholder={sdk.t("config.baseUrl.placeholder")}
        />
      </div>

      <div className="cds--form-item">
        <label htmlFor="apiToken" className="cds--label">
          {sdk.t("config.apiToken.label")} <span className="required">(vereist)</span> <TooltipIcon />
        </label>
        <input
          id="apiToken"
          type="password"
          className="cds--text-input"
          value={apiToken}
          onChange={(e) => { setApiToken(e.target.value); emit(title, baseUrl, e.target.value); }}
          placeholder={sdk.t("config.apiToken.placeholder")}
        />
      </div>
    </div>
  );
}

sdk.ready().then(() => createRoot(document.getElementById("root")!).render(<ConfigForm />));
