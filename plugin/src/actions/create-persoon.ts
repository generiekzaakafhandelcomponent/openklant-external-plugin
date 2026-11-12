import type {ActionInput, ActionOutput} from "@valtimo/plugin-sdk";
import {action, httpRequest, log} from "@valtimo/plugin-sdk";
import {getAuthHeaders, getBaseUrl} from "../helpers";
import type {PersoonResponse} from "../types";

interface CreatePersoonInput {
  geslacht?: string;
  voornamen?: string;
  geslachtsnaam: string;
  voorvoegsel?: string;
  geboortedatum?: string;
  straat?: string;
  huisnummer?: string;
  postcode?: string;
  stad?: string;
  land?: string;
}

action("create-persoon", (input: ActionInput): ActionOutput => {
  const props = input.properties as CreatePersoonInput;

  log.info("Creating persoon (contactgegevens)", {geslachtsnaam: props.geslachtsnaam});

  if (!props.geslachtsnaam) {
    return {
      status: "error",
      errorCode: "VALIDATION_ERROR",
      errorMessage: "geslachtsnaam is required",
    };
  }

  const baseUrl = getBaseUrl();

  const payload: Record<string, unknown> = {
    geslacht: props.geslacht || "",
    naam: {
      voornamen: props.voornamen || "",
      geslachtsnaam: props.geslachtsnaam,
      voorvoegsel: props.voorvoegsel || "",
    },
  };

  if (props.geboortedatum) {
    payload.geboortedatum = props.geboortedatum;
  }

  if (props.straat || props.postcode || props.stad) {
    payload.adres = {
      straatnaam: props.straat || "",
      huisnummer: props.huisnummer ? parseInt(props.huisnummer) : null,
      postcode: props.postcode || "",
      stad: props.stad || "",
      land: props.land || "NL",
    };
  }

  const response = httpRequest.post<PersoonResponse>(
    `${baseUrl}/contactgegevens/api/v1/persoon`,
    payload,
    getAuthHeaders()
  );

  if (response.status !== 201 && response.status !== 200) {
    log.error("Failed to create persoon", {status: response.status, body: response.body});
    return {
      status: "error",
      errorCode: `HTTP_${response.status}`,
      errorMessage: `Failed to create persoon: ${JSON.stringify(response.body)}`,
    };
  }

  const persoon = response.body;
  log.info("Persoon created", {uuid: persoon.uuid});

  return {
    status: "completed",
    variables: {persoonUuid: persoon.uuid},
    result: {success: true, persoonUuid: persoon.uuid},
  };
});
