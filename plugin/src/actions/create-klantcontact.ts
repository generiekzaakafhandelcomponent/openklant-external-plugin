import type {ActionInput, ActionOutput} from "@valtimo/plugin-sdk";
import {action, httpRequest, log} from "@valtimo/plugin-sdk";
import {getAuthHeaders, getBaseUrl} from "../helpers";
import type {KlantcontactResponse} from "../types";

interface CreateKlantcontactInput {
  kanaal: string;
  onderwerp: string;
  inhoud?: string;
  taal?: string;
  vertrouwelijk?: boolean;
  plaatsgevondenOp?: string;
  partijId?: string;
  zaakUrl?: string;
}

action("create-klantcontact", (input: ActionInput): ActionOutput => {
  const props = input.properties as CreateKlantcontactInput;

  log.info("Creating klantcontact", {kanaal: props.kanaal, onderwerp: props.onderwerp});

  if (!props.kanaal || !props.onderwerp) {
    return {
      status: "error",
      errorCode: "VALIDATION_ERROR",
      errorMessage: "kanaal and onderwerp are required",
    };
  }

  const baseUrl = getBaseUrl();

  const payload = {
    kanaal: props.kanaal,
    onderwerp: props.onderwerp,
    inhoud: props.inhoud || "",
    taal: props.taal || "nld",
    vertrouwelijk: props.vertrouwelijk ?? false,
    plaatsgevondenOp: props.plaatsgevondenOp || new Date().toISOString(),
  };

  const response = httpRequest.post<KlantcontactResponse>(
    `${baseUrl}/klantinteracties/api/v1/klantcontacten`,
    payload,
    getAuthHeaders()
  );

  if (response.status !== 201 && response.status !== 200) {
    log.error("Failed to create klantcontact", {status: response.status, body: response.body});
    return {
      status: "error",
      errorCode: `HTTP_${response.status}`,
      errorMessage: `Failed to create klantcontact: ${JSON.stringify(response.body)}`,
    };
  }

  const klantcontact = response.body;
  log.info("Klantcontact created", {uuid: klantcontact.uuid});

  // Link betrokkene if partijId provided
  if (props.partijId) {
    const betrokkeneResponse = httpRequest.post(
      `${baseUrl}/klantinteracties/api/v1/betrokkenen`,
      {
        hadKlantcontact: {uuid: klantcontact.uuid},
        wasPartij: {uuid: props.partijId},
        rol: "klant",
        initiator: true,
      },
      getAuthHeaders()
    );

    if (betrokkeneResponse.status !== 201 && betrokkeneResponse.status !== 200) {
      log.warn("Failed to create betrokkene", {status: betrokkeneResponse.status, body: betrokkeneResponse.body});
    } else {
      log.info("Betrokkene linked to klantcontact");
    }
  }

  // Link zaak as onderwerpobject if zaakUrl provided
  if (props.zaakUrl) {
    const onderwerpResponse = httpRequest.post(
      `${baseUrl}/klantinteracties/api/v1/onderwerpobjecten`,
      {
        klantcontact: {uuid: klantcontact.uuid},
        onderwerpobjectidentificator: {
          codeObjecttype: "ZAAK",
          codeSoortObjectId: "zaak_url",
          objectId: props.zaakUrl,
          codeRegister: "zaken_api",
        },
      },
      getAuthHeaders()
    );

    if (onderwerpResponse.status !== 201 && onderwerpResponse.status !== 200) {
      log.warn("Failed to create onderwerpobject", {status: onderwerpResponse.status, body: onderwerpResponse.body});
    } else {
      log.info("Zaak linked as onderwerpobject");
    }
  }

  return {
    status: "completed",
    variables: {klantcontactUuid: klantcontact.uuid},
    result: {success: true, klantcontactUuid: klantcontact.uuid, klantcontactNummer: klantcontact.nummer},
  };
});
