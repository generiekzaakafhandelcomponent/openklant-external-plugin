import type {ActionInput, ActionOutput} from "@valtimo/plugin-sdk";
import {action, httpRequest, log} from "@valtimo/plugin-sdk";
import {getAuthHeaders, getBaseUrl} from "../helpers";
import type {OrganisatieResponse} from "../types";

interface CreateOrganisatieInput {
  handelsnaam: string;
  oprichtingsdatum?: string;
  straat?: string;
  huisnummer?: string;
  postcode?: string;
  stad?: string;
  land?: string;
}

action("create-organisatie", (input: ActionInput): ActionOutput => {
  const props = input.properties as CreateOrganisatieInput;

  log.info("Creating organisatie (contactgegevens)", {handelsnaam: props.handelsnaam});

  if (!props.handelsnaam) {
    return {
      status: "error",
      errorCode: "VALIDATION_ERROR",
      errorMessage: "handelsnaam is required",
    };
  }

  const baseUrl = getBaseUrl();

  const payload: Record<string, unknown> = {
    handelsnaam: props.handelsnaam,
  };

  if (props.oprichtingsdatum) {
    payload.oprichtingsdatum = props.oprichtingsdatum;
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

  const response = httpRequest.post<OrganisatieResponse>(
    `${baseUrl}/contactgegevens/api/v1/organisatie`,
    payload,
    getAuthHeaders()
  );

  if (response.status !== 201 && response.status !== 200) {
    log.error("Failed to create organisatie", {status: response.status, body: response.body});
    return {
      status: "error",
      errorCode: `HTTP_${response.status}`,
      errorMessage: `Failed to create organisatie: ${JSON.stringify(response.body)}`,
    };
  }

  const organisatie = response.body;
  log.info("Organisatie created", {uuid: organisatie.uuid});

  return {
    status: "completed",
    variables: {organisatieUuid: organisatie.uuid},
    result: {success: true, organisatieUuid: organisatie.uuid},
  };
});
