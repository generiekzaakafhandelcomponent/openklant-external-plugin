import React, {useCallback, useEffect, useState} from "react";
import {createRoot} from "react-dom/client";
import {ValtimoPluginSDK} from "@valtimo/plugin-sdk/frontend";

const sdk = new ValtimoPluginSDK();

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

function ActionConfigForm() {
  const [kanaal, setKanaal] = useState("");
  const [onderwerp, setOnderwerp] = useState("");
  const [inhoud, setInhoud] = useState("");
  const [partijId, setPartijId] = useState("");
  const [zaakUrl, setZaakUrl] = useState("");

  useEffect(() => {
    applyTheme(sdk.getTheme());
    sdk.onThemeChanged((theme) => applyTheme(theme));

    sdk.onPrefillConfiguration(({configuration}) => {
      if (configuration.kanaal) setKanaal(configuration.kanaal as string);
      if (configuration.onderwerp) setOnderwerp(configuration.onderwerp as string);
      if (configuration.inhoud) setInhoud(configuration.inhoud as string);
      if (configuration.partijId) setPartijId(configuration.partijId as string);
      if (configuration.zaakUrl) setZaakUrl(configuration.zaakUrl as string);
    });
    sdk.onSave(() => {});
    sdk.emit("ready", {});
  }, []);

  const emit = useCallback((k: string, o: string, i: string, p: string, z: string) => {
    const valid = k.trim().length > 0 && o.trim().length > 0;
    sdk.setConfiguration(valid, "", {
      kanaal: k.trim() || undefined,
      onderwerp: o.trim() || undefined,
      inhoud: i.trim() || undefined,
      partijId: p.trim() || undefined,
      zaakUrl: z.trim() || undefined,
    });
  }, []);

  return (
    <div className="cds--form">
      <div className="cds--form-item">
        <label htmlFor="kanaal" className="cds--label">
          {sdk.t("actionConfig.kanaal.label")} <span className="required">(vereist)</span> <TooltipIcon />
        </label>
        <input
          id="kanaal"
          type="text"
          className="cds--text-input"
          value={kanaal}
          onChange={(e) => { setKanaal(e.target.value); emit(e.target.value, onderwerp, inhoud, partijId, zaakUrl); }}
          placeholder={sdk.t("actionConfig.kanaal.placeholder")}
        />
      </div>

      <div className="cds--form-item">
        <label htmlFor="onderwerp" className="cds--label">
          {sdk.t("actionConfig.onderwerp.label")} <span className="required">(vereist)</span> <TooltipIcon />
        </label>
        <input
          id="onderwerp"
          type="text"
          className="cds--text-input"
          value={onderwerp}
          onChange={(e) => { setOnderwerp(e.target.value); emit(kanaal, e.target.value, inhoud, partijId, zaakUrl); }}
          placeholder={sdk.t("actionConfig.onderwerp.placeholder")}
        />
      </div>

      <div className="cds--form-item">
        <label htmlFor="inhoud" className="cds--label">
          {sdk.t("actionConfig.inhoud.label")} <TooltipIcon />
        </label>
        <textarea
          id="inhoud"
          className="cds--text-input"
          value={inhoud}
          onChange={(e) => { setInhoud(e.target.value); emit(kanaal, onderwerp, e.target.value, partijId, zaakUrl); }}
          placeholder={sdk.t("actionConfig.inhoud.placeholder")}
          style={{minHeight: "80px", resize: "vertical"}}
        />
      </div>

      <div className="cds--form-item">
        <label htmlFor="partijId" className="cds--label">
          {sdk.t("actionConfig.partijId.label")} <TooltipIcon />
        </label>
        <input
          id="partijId"
          type="text"
          className="cds--text-input"
          value={partijId}
          onChange={(e) => { setPartijId(e.target.value); emit(kanaal, onderwerp, inhoud, e.target.value, zaakUrl); }}
          placeholder={sdk.t("actionConfig.partijId.placeholder")}
        />
      </div>

      <div className="cds--form-item">
        <label htmlFor="zaakUrl" className="cds--label">
          {sdk.t("actionConfig.zaakUrl.label")} <TooltipIcon />
        </label>
        <input
          id="zaakUrl"
          type="text"
          className="cds--text-input"
          value={zaakUrl}
          onChange={(e) => { setZaakUrl(e.target.value); emit(kanaal, onderwerp, inhoud, partijId, e.target.value); }}
          placeholder={sdk.t("actionConfig.zaakUrl.placeholder")}
        />
      </div>
    </div>
  );
}

sdk.ready().then(() => createRoot(document.getElementById("root")!).render(<ActionConfigForm />));
