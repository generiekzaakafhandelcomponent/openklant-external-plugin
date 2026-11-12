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
  const [naam, setNaam] = useState("");
  const [kvkNummer, setKvkNummer] = useState("");
  const [email, setEmail] = useState("");
  const [telefoon, setTelefoon] = useState("");

  useEffect(() => {
    applyTheme(sdk.getTheme());
    sdk.onThemeChanged((theme) => applyTheme(theme));

    sdk.onPrefillConfiguration(({configuration}) => {
      if (configuration.naam) setNaam(configuration.naam as string);
      if (configuration.kvkNummer) setKvkNummer(configuration.kvkNummer as string);
      if (configuration.email) setEmail(configuration.email as string);
      if (configuration.telefoon) setTelefoon(configuration.telefoon as string);
    });
    sdk.onSave(() => {});
    sdk.emit("ready", {});
  }, []);

  const emit = useCallback((n: string, k: string, e: string, t: string) => {
    const valid = n.trim().length > 0;
    sdk.setConfiguration(valid, "", {
      naam: n.trim() || undefined,
      kvkNummer: k.trim() || undefined,
      email: e.trim() || undefined,
      telefoon: t.trim() || undefined,
    });
  }, []);

  return (
    <div className="cds--form">
      <div className="cds--form-item">
        <label htmlFor="naam" className="cds--label">{sdk.t("actionConfig.naam.label")} <span className="required">(vereist)</span> <TooltipIcon /></label>
        <input id="naam" type="text" className="cds--text-input" value={naam}
          onChange={(e) => { setNaam(e.target.value); emit(e.target.value, kvkNummer, email, telefoon); }} />
      </div>
      <div className="cds--form-item">
        <label htmlFor="kvkNummer" className="cds--label">{sdk.t("actionConfig.kvkNummer.label")} <TooltipIcon /></label>
        <input id="kvkNummer" type="text" className="cds--text-input" value={kvkNummer}
          onChange={(e) => { setKvkNummer(e.target.value); emit(naam, e.target.value, email, telefoon); }} />
      </div>
      <div className="cds--form-item">
        <label htmlFor="email" className="cds--label">{sdk.t("actionConfig.email.label")} <TooltipIcon /></label>
        <input id="email" type="email" className="cds--text-input" value={email}
          onChange={(e) => { setEmail(e.target.value); emit(naam, kvkNummer, e.target.value, telefoon); }} />
      </div>
      <div className="cds--form-item">
        <label htmlFor="telefoon" className="cds--label">{sdk.t("actionConfig.telefoon.label")} <TooltipIcon /></label>
        <input id="telefoon" type="tel" className="cds--text-input" value={telefoon}
          onChange={(e) => { setTelefoon(e.target.value); emit(naam, kvkNummer, email, e.target.value); }} />
      </div>
    </div>
  );
}

sdk.ready().then(() => createRoot(document.getElementById("root")!).render(<ActionConfigForm />));
