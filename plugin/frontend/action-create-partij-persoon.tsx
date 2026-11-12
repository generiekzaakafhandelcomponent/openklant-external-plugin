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
  const [voornaam, setVoornaam] = useState("");
  const [achternaam, setAchternaam] = useState("");
  const [bsn, setBsn] = useState("");
  const [email, setEmail] = useState("");
  const [telefoon, setTelefoon] = useState("");

  useEffect(() => {
    applyTheme(sdk.getTheme());
    sdk.onThemeChanged((theme) => applyTheme(theme));

    sdk.onPrefillConfiguration(({configuration}) => {
      if (configuration.voornaam) setVoornaam(configuration.voornaam as string);
      if (configuration.achternaam) setAchternaam(configuration.achternaam as string);
      if (configuration.bsn) setBsn(configuration.bsn as string);
      if (configuration.email) setEmail(configuration.email as string);
      if (configuration.telefoon) setTelefoon(configuration.telefoon as string);
    });
    sdk.onSave(() => {});
    sdk.emit("ready", {});
  }, []);

  const emit = useCallback((v: string, a: string, b: string, e: string, t: string) => {
    const valid = a.trim().length > 0;
    sdk.setConfiguration(valid, "", {
      voornaam: v.trim() || undefined,
      achternaam: a.trim() || undefined,
      bsn: b.trim() || undefined,
      email: e.trim() || undefined,
      telefoon: t.trim() || undefined,
    });
  }, []);

  return (
    <div className="cds--form">
      <div className="cds--form-item">
        <label htmlFor="voornaam" className="cds--label">{sdk.t("actionConfig.voornaam.label")} <TooltipIcon /></label>
        <input id="voornaam" type="text" className="cds--text-input" value={voornaam}
          onChange={(e) => { setVoornaam(e.target.value); emit(e.target.value, achternaam, bsn, email, telefoon); }} />
      </div>
      <div className="cds--form-item">
        <label htmlFor="achternaam" className="cds--label">{sdk.t("actionConfig.achternaam.label")} <span className="required">(vereist)</span> <TooltipIcon /></label>
        <input id="achternaam" type="text" className="cds--text-input" value={achternaam}
          onChange={(e) => { setAchternaam(e.target.value); emit(voornaam, e.target.value, bsn, email, telefoon); }} />
      </div>
      <div className="cds--form-item">
        <label htmlFor="bsn" className="cds--label">{sdk.t("actionConfig.bsn.label")} <TooltipIcon /></label>
        <input id="bsn" type="text" className="cds--text-input" value={bsn}
          onChange={(e) => { setBsn(e.target.value); emit(voornaam, achternaam, e.target.value, email, telefoon); }} />
      </div>
      <div className="cds--form-item">
        <label htmlFor="email" className="cds--label">{sdk.t("actionConfig.email.label")} <TooltipIcon /></label>
        <input id="email" type="email" className="cds--text-input" value={email}
          onChange={(e) => { setEmail(e.target.value); emit(voornaam, achternaam, bsn, e.target.value, telefoon); }} />
      </div>
      <div className="cds--form-item">
        <label htmlFor="telefoon" className="cds--label">{sdk.t("actionConfig.telefoon.label")} <TooltipIcon /></label>
        <input id="telefoon" type="tel" className="cds--text-input" value={telefoon}
          onChange={(e) => { setTelefoon(e.target.value); emit(voornaam, achternaam, bsn, email, e.target.value); }} />
      </div>
    </div>
  );
}

sdk.ready().then(() => createRoot(document.getElementById("root")!).render(<ActionConfigForm />));
