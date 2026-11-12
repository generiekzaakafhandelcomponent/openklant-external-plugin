import type {ActionInput, ActionOutput} from "@valtimo/plugin-sdk";
import {action, httpRequest, log} from "@valtimo/plugin-sdk";
import {getAuthHeaders, getBaseUrl} from "../helpers";
import type {PartijResponse} from "../types";

interface CreatePartijOrganisatieInput {
  naam: string;
  kvkNummer?: string;
  email?: string;
  telefoon?: string;
  straat?: string;
  huisnummer?: string;
  postcode?: string;
  stad?: string;
}

action("create-partij-organisatie", (input: ActionInput): ActionOutput => {
  const props = input.properties as CreatePartijOrganisatieInput;

  log.info("Creating partij (organisatie)", {naam: props.naam});

  if (!props.naam) {
    return {
      status: "error",
      errorCode: "VALIDATION_ERROR",
      errorMessage: "naam is required",
    };
  }

  const baseUrl = getBaseUrl();

  const payload: Record<string, unknown> = {
    soortPartij: "organisatie",
    indicatieActief: true,
    voorkeurstaal: "nld",
    partijIdentificatie: {
      naam: props.naam,
    },
  };

  if (props.straat || props.postcode || props.stad) {
    payload.bezoekadres = {
      straatnaam: props.straat || "",
      huisnummer: props.huisnummer ? parseInt(props.huisnummer) : null,
      postcode: props.postcode || "",
      stad: props.stad || "",
      land: "NL",
      adresregel1: props.straat ? `${props.straat} ${props.huisnummer || ""}`.trim() : "",
      adresregel2: "",
      adresregel3: "",
    };
  }

  const response = httpRequest.post<PartijResponse>(
    `${baseUrl}/klantinteracties/api/v1/partijen`,
    payload,
    getAuthHeaders()
  );

  if (response.status !== 201 && response.status !== 200) {
    log.error("Failed to create partij", {status: response.status, body: response.body});
    return {
      status: "error",
      errorCode: `HTTP_${response.status}`,
      errorMessage: `Failed to create partij: ${JSON.stringify(response.body)}`,
    };
  }

  const partij = response.body;
  log.info("Partij created", {uuid: partij.uuid});

  // Add KVK nummer as partij-identificator
  if (props.kvkNummer) {
    httpRequest.post(
      `${baseUrl}/klantinteracties/api/v1/partij-identificatoren`,
      {
        identificeerdePartij: {uuid: partij.uuid},
        partijIdentificator: {
          codeObjecttype: "niet_natuurlijk_persoon",
          codeSoortObjectId: "kvk_nummer",
          objectId: props.kvkNummer,
          codeRegister: "hr",
        },
      },
      getAuthHeaders()
    );
  }

  // Add email
  if (props.email) {
    httpRequest.post(
      `${baseUrl}/klantinteracties/api/v1/digitaleadressen`,
      {
        partij: {uuid: partij.uuid},
        soortDigitaalAdres: "email",
        adres: props.email,
        omschrijving: "E-mail",
        isStandaardAdres: true,
      },
      getAuthHeaders()
    );
  }

  // Add telefoon
  if (props.telefoon) {
    httpRequest.post(
      `${baseUrl}/klantinteracties/api/v1/digitaleadressen`,
      {
        partij: {uuid: partij.uuid},
        soortDigitaalAdres: "telefoon",
        adres: props.telefoon,
        omschrijving: "Telefoon",
        isStandaardAdres: !props.email,
      },
      getAuthHeaders()
    );
  }

  return {
    status: "completed",
    variables: {partijUuid: partij.uuid},
    result: {success: true, partijUuid: partij.uuid, partijNummer: partij.nummer},
  };
});
