import type {ActionInput, ActionOutput} from "@valtimo/plugin-sdk";
import {action, httpRequest, log} from "@valtimo/plugin-sdk";
import {getAuthHeaders, getBaseUrl} from "../helpers";

interface GetPartijInput {
  identificatorType: string;
  identificatorValue: string;
}

interface PartijListResponse {
  count: number;
  results: Array<{
    uuid: string;
    url: string;
    nummer?: string;
  }>;
}

action("get-partij", (input: ActionInput): ActionOutput => {
  const props = input.properties as GetPartijInput;

  log.info("Searching for partij", {
    identificatorType: props.identificatorType,
    identificatorValue: props.identificatorValue,
  });

  if (!props.identificatorType || !props.identificatorValue) {
    return {
      status: "error",
      errorCode: "VALIDATION_ERROR",
      errorMessage: "identificatorType and identificatorValue are required",
    };
  }

  const baseUrl = getBaseUrl();
  const searchUrl = `${baseUrl}/klantinteracties/api/v1/partijen?partijIdentificator__codeSoortObjectId=${encodeURIComponent(props.identificatorType)}&partijIdentificator__objectId=${encodeURIComponent(props.identificatorValue)}`;

  log.debug("Searching partijen", {url: searchUrl});

  const response = httpRequest.get<PartijListResponse>(searchUrl, getAuthHeaders());

  if (response.status !== 200) {
    log.error("Failed to search partijen", {status: response.status, body: response.body});
    return {
      status: "error",
      errorCode: `HTTP_${response.status}`,
      errorMessage: `Failed to search partijen: ${JSON.stringify(response.body)}`,
    };
  }

  const found = response.body.count > 0;
  const partijUuid = found ? response.body.results[0].uuid : null;

  if (found) {
    log.info("Partij found", {uuid: partijUuid, total: response.body.count});
  } else {
    log.info("No partij found", {identificatorType: props.identificatorType, identificatorValue: props.identificatorValue});
  }

  return {
    status: "completed",
    variables: {
      partijUuid: partijUuid,
      partijFound: found,
    },
    result: {
      partijUuid: partijUuid,
      partijFound: found,
    },
  };
});
