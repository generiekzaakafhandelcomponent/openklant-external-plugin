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
  const [klantcontactId, setKlantcontactId] = useState("");
  const [klantcontactNummer, setKlantcontactNummer] = useState("");
  const [documentPath, setDocumentPath] = useState("/klantcontact");

  useEffect(() => {
    applyTheme(sdk.getTheme());
    sdk.onThemeChanged((theme) => applyTheme(theme));

    sdk.onPrefillConfiguration(({configuration}) => {
      if (configuration.klantcontactId) setKlantcontactId(configuration.klantcontactId as string);
      if (configuration.klantcontactNummer) setKlantcontactNummer(configuration.klantcontactNummer as string);
      if (configuration.documentPath) setDocumentPath(configuration.documentPath as string);
    });
    sdk.onSave(() => {});
    sdk.emit("ready", {});
  }, []);

  const emit = useCallback((nextKlantcontactId: string, nextKlantcontactNummer: string, nextDocumentPath: string) => {
    const hasIdentifier = nextKlantcontactId.trim().length > 0 || nextKlantcontactNummer.trim().length > 0;
    const valid = hasIdentifier && nextDocumentPath.trim().length > 0;
    sdk.setConfiguration(valid, "", {
      klantcontactId: nextKlantcontactId.trim() || undefined,
      klantcontactNummer: nextKlantcontactNummer.trim() || undefined,
      documentPath: nextDocumentPath.trim(),
    });
  }, []);

  return (
    <div className="cds--form">
      <div className="cds--form-item">
        <label htmlFor="klantcontactId" className="cds--label">
          {sdk.t("actionConfig.klantcontactId.label")} <TooltipIcon />
        </label>
        <input
          id="klantcontactId"
          type="text"
          className="cds--text-input"
          value={klantcontactId}
          onChange={(e) => {
            setKlantcontactId(e.target.value);
            emit(e.target.value, klantcontactNummer, documentPath);
          }}
          placeholder={sdk.t("actionConfig.klantcontactId.placeholder")}
        />
      </div>

      <div className="cds--form-item">
        <label htmlFor="klantcontactNummer" className="cds--label">
          {sdk.t("actionConfig.klantcontactNummer.label")} <TooltipIcon />
        </label>
        <input
          id="klantcontactNummer"
          type="text"
          className="cds--text-input"
          value={klantcontactNummer}
          onChange={(e) => {
            setKlantcontactNummer(e.target.value);
            emit(klantcontactId, e.target.value, documentPath);
          }}
          placeholder={sdk.t("actionConfig.klantcontactNummer.placeholder")}
        />
      </div>

      <div className="cds--form-item">
        <label htmlFor="documentPath" className="cds--label">
          {sdk.t("actionConfig.documentPath.label")} <span className="required">(vereist)</span> <TooltipIcon />
        </label>
        <input
          id="documentPath"
          type="text"
          className="cds--text-input"
          value={documentPath}
          onChange={(e) => {
            setDocumentPath(e.target.value);
            emit(klantcontactId, klantcontactNummer, e.target.value);
          }}
          placeholder={sdk.t("actionConfig.documentPath.placeholder")}
        />
      </div>
    </div>
  );
}

sdk.ready().then(() => createRoot(document.getElementById("root")!).render(<ActionConfigForm />));
