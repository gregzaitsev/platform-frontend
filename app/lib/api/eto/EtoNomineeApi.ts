import { inject, injectable } from "inversify";

import { symbols } from "../../../di/symbols";
import { IHttpClient } from "../client/IHttpClient";
import { withParams } from "../../../utils/withParams";
import { TNomineeRequestResponse } from "./EtoApi.interfaces.unsafe";

const BASE_PATH = "/api/eto-listing/etos";
const CREATE_NOMINEE_REQUEST_PATH = "/:etoId/nominee-requests/me";

export class EtoNomineeApiError extends Error {}
export class IssuerIdInvalid extends EtoNomineeApiError {}
export class NomineeRequestExists extends EtoNomineeApiError {}

@injectable()
export class EtoNomineeApi {
  constructor(@inject(symbols.authorizedJsonHttpClient) private httpClient: IHttpClient) {}

  //according to our convention, etoId === issuerId during the eto preview stage
  public async createNomineeLinkRequest(issuerId: string): Promise<TNomineeRequestResponse> {
    const response = await this.httpClient.post<TNomineeRequestResponse>({
      baseUrl: BASE_PATH,
      url: withParams(CREATE_NOMINEE_REQUEST_PATH, { etoId:issuerId }),
      allowedStatusCodes: [400, 404, 409],
    });
    if (response.statusCode === 400 || response.statusCode === 404) {
      throw new IssuerIdInvalid();
    } else if(response.statusCode === 409) {
      throw new NomineeRequestExists();
    } else {
      return response.body;
    }

  }

  // todo this is a dummy, won't work
  public async getNomineeLinkRequestStatus(): Promise<void> {
    await this.httpClient.get<void>({
      baseUrl: BASE_PATH,
      url: `/user/me/nominee_task_status`,
    })
  }
}
