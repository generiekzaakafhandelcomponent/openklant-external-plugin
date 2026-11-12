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
  const [geslachtsnaam, setGeslachtsnaam] = useState("");
  const [voornamen, setVoornamen] = useState("");
  const [geboortedatum, setGeboortedatum] = useState("");

  useEffect(() => {
    applyTheme(sdk.getTheme());
    sdk.onThemeChanged((theme) => applyTheme(theme));

    sdk.onPrefillConfiguration(({configuration}) => {
      if (configuration.geslachtsnaam) setGeslachtsnaam(configuration.geslachtsnaam as string);
      if (configuration.voornamen) setVoornamen(configuration.voornamen as string);
      if (configuration.geboortedatum) setGeboortedatum(configuration.geboortedatum as string);
    });
    sdk.onSave(() => {});
    sdk.emit("ready", {});
  }, []);

  const emit = useCallback((g: string, v: string, d: string) => {
    const valid = g.trim().length > 0;
    sdk.setConfiguration(valid, "", {
      geslachtsnaam: g.trim() || undefined,
      voornamen: v.trim() || undefined,
      geboortedatum: d.trim() || undefined,
    });
  }, []);

  return (
    <div className="cds--form">
      <div className="cds--form-item">
        <label htmlFor="geslachtsnaam" className="cds--label">{sdk.t("actionConfig.geslachtsnaam.label")} <span className="required">(vereist)</span> <TooltipIcon /></label>
        <input id="geslachtsnaam" type="text" className="cds--text-input" value={geslachtsnaam}
          onChange={(e) => { setGeslachtsnaam(e.target.value); emit(e.target.value, voornamen, geboortedatum); }} />
      </div>
      <div className="cds--form-item">
        <label htmlFor="voornamen" className="cds--label">{sdk.t("actionConfig.voornaam.label")} <TooltipIcon /></label>
        <input id="voornamen" type="text" className="cds--text-input" value={voornamen}
          onChange={(e) => { setVoornamen(e.target.value); emit(geslachtsnaam, e.target.value, geboortedatum); }} />
      </div>
      <div className="cds--form-item">
        <label htmlFor="geboortedatum" className="cds--label">{sdk.t("actionConfig.geboortedatum.label")} <TooltipIcon /></label>
        <input id="geboortedatum" type="date" className="cds--text-input" value={geboortedatum}
          onChange={(e) => { setGeboortedatum(e.target.value); emit(geslachtsnaam, voornamen, e.target.value); }} />
      </div>
    </div>
  );
}

sdk.ready().then(() => createRoot(document.getElementById("root")!).render(<ActionConfigForm />));
