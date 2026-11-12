export interface KlantcontactResponse {
  uuid: string;
  url: string;
  nummer?: string;
  kanaal?: string;
  onderwerp?: string;
  inhoud?: string;
  indicatieContactGelukt?: boolean;
  taal?: string;
  vertrouwelijk?: boolean;
  plaatsgevondenOp?: string;
  hadBetrokkenen?: Betrokkene[];
  gingOverOnderwerpobjecten?: Onderwerpobject[];
  leiddeTotInterneTaken?: Array<{uuid: string; url: string}>;
  omvatteBijlagen?: Array<{uuid: string; url: string}>;
}

export interface Betrokkene {
  uuid: string;
  url: string;
  rol?: string;
  initiator?: boolean;
  contactnaam?: {
    voorletters?: string;
    voornaam?: string;
    voorvoegselAchternaam?: string;
    achternaam?: string;
  };
  organisatienaam?: string;
  wasPartij?: Partij;
  digitaleAdressen?: DigitaalAdres[];
}

export interface Partij {
  uuid: string;
  url: string;
  nummer?: string;
  soortPartij?: string;
  partijIdentificatoren?: PartijIdentificator[];
}

export interface PartijIdentificator {
  uuid?: string;
  partijIdentificator?: {
    codeObjecttype?: string;
    codeSoortObjectId?: string;
    objectId?: string;
    codeRegister?: string;
  };
}

export interface DigitaalAdres {
  uuid: string;
  url: string;
  soortDigitaalAdres?: string;
  adres?: string;
  omschrijving?: string;
}

export interface Onderwerpobject {
  uuid: string;
  url: string;
  onderwerpobjectidentificator?: {
    codeObjecttype?: string;
    codeSoortObjectId?: string;
    objectId?: string;
    codeRegister?: string;
  };
}

export interface KlantcontactListResponse {
  count: number;
  results: KlantcontactResponse[];
}

export interface DocumentResponse {
  content: Record<string, unknown>;
  definitionName?: string;
  version?: number;
}

export interface PartijResponse {
  uuid: string;
  url: string;
  nummer?: string;
}

export interface PersoonResponse {
  uuid: string;
  url: string;
}

export interface OrganisatieResponse {
  uuid: string;
  url: string;
}
