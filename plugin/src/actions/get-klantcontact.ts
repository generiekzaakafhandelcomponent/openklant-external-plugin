import type {ActionInput, ActionOutput} from "@valtimo/plugin-sdk";
import {action, gzacApi, httpRequest, log} from "@valtimo/plugin-sdk";
import {getAuthHeaders, getBaseUrl, setAtPath} from "../helpers";
import type {KlantcontactResponse, KlantcontactListResponse, DocumentResponse} from "../types";

interface GetKlantcontactInput {
  klantcontactId?: string;
  klantcontactNummer?: string;
  documentPath: string;
}

action("get-klantcontact", (input: ActionInput): ActionOutput => {
  const props = input.properties as GetKlantcontactInput;

  log.info("Fetching klantcontact", {
    klantcontactId: props.klantcontactId,
    klantcontactNummer: props.klantcontactNummer,
    documentPath: props.documentPath,
    documentId: input.documentId,
  });

  if (!props.klantcontactId && !props.klantcontactNummer) {
    log.error("Neither klantcontactId nor klantcontactNummer provided");
    return {
      status: "error",
      errorCode: "VALIDATION_ERROR",
      errorMessage: "Either klantcontactId (UUID) or klantcontactNummer must be provided",
    };
  }

  const baseUrl = getBaseUrl();
  const expandParams = [
    "hadBetrokkenen",
    "hadBetrokkenen.wasPartij",
    "hadBetrokkenen.digitaleAdressen",
    "gingOverOnderwerpobjecten",
    "leiddeTotInterneTaken",
    "omvatteBijlagen",
  ].join(",");

  let klantcontactData: KlantcontactResponse;

  if (props.klantcontactId) {
    const klantcontactUrl = `${baseUrl}/klantinteracties/api/v1/klantcontacten/${props.klantcontactId}?expand=${expandParams}`;
    log.debug("Calling Open Klant API by UUID", {url: klantcontactUrl});

    const response = httpRequest.get<KlantcontactResponse>(klantcontactUrl, getAuthHeaders());

    if (response.status !== 200) {
      log.error("Failed to fetch klantcontact by UUID", {status: response.status, body: response.body});
      return {
        status: "error",
        errorCode: `HTTP_${response.status}`,
        errorMessage: `Failed to fetch klantcontact: ${JSON.stringify(response.body)}`,
      };
    }
    klantcontactData = response.body;
  } else {
    const searchUrl = `${baseUrl}/klantinteracties/api/v1/klantcontacten?nummer=${props.klantcontactNummer}`;
    log.debug("Searching Open Klant API by nummer", {url: searchUrl});

    const searchResponse = httpRequest.get<KlantcontactListResponse>(searchUrl, getAuthHeaders());

    if (searchResponse.status !== 200) {
      log.error("Failed to search klantcontact", {status: searchResponse.status, body: searchResponse.body});
      return {
        status: "error",
        errorCode: `HTTP_${searchResponse.status}`,
        errorMessage: `Failed to search klantcontact: ${JSON.stringify(searchResponse.body)}`,
      };
    }

    if (searchResponse.body.count === 0) {
      log.error("No klantcontact found", {nummer: props.klantcontactNummer});
      return {
        status: "error",
        errorCode: "NOT_FOUND",
        errorMessage: `No klantcontact found with nummer: ${props.klantcontactNummer}`,
      };
    }

    if (searchResponse.body.count > 1) {
      log.warn("Multiple klantcontacten found, using first", {nummer: props.klantcontactNummer, count: searchResponse.body.count});
    }

    const foundUuid = searchResponse.body.results[0].uuid;
    const klantcontactUrl = `${baseUrl}/klantinteracties/api/v1/klantcontacten/${foundUuid}?expand=${expandParams}`;
    const response = httpRequest.get<KlantcontactResponse>(klantcontactUrl, getAuthHeaders());

    if (response.status !== 200) {
      log.error("Failed to fetch klantcontact", {status: response.status, body: response.body});
      return {
        status: "error",
        errorCode: `HTTP_${response.status}`,
        errorMessage: `Failed to fetch klantcontact: ${JSON.stringify(response.body)}`,
      };
    }
    klantcontactData = response.body;
  }

  log.info("Klantcontact fetched", {uuid: klantcontactData.uuid});

  const documentResponse = gzacApi.get<DocumentResponse>(`/api/v1/document/${input.documentId}`);
  if (documentResponse.status !== 200) {
    log.error("Failed to fetch document", {status: documentResponse.status, documentId: input.documentId});
    return {
      status: "error",
      errorCode: "DOCUMENT_FETCH_ERROR",
      errorMessage: `Failed to fetch document: ${documentResponse.status}`,
    };
  }

  const documentContent = documentResponse.body.content || {};
  setAtPath(documentContent, props.documentPath, klantcontactData);

  const updateResponse = gzacApi.put<{documentId: string}>("/api/v1/document", {
    documentId: input.documentId,
    content: documentContent,
  });

  if (updateResponse.status !== 200) {
    log.error("Failed to update document", {status: updateResponse.status, body: updateResponse.body});
    return {
      status: "error",
      errorCode: "DOCUMENT_UPDATE_ERROR",
      errorMessage: `Failed to update document: ${JSON.stringify(updateResponse.body)}`,
    };
  }

  log.info("Document updated", {documentId: input.documentId, path: props.documentPath});

  return {
    status: "completed",
    variables: {success: true},
    result: {success: true, klantcontactUuid: klantcontactData.uuid},
  };
});
