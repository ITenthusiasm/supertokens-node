// @ts-nocheck
import { RecipeInterface as OpenIdRecipeInterface } from "../../openid/types";
import { SessionClaimValidator, SessionContainerInterface } from "../types";
export default class SessionClassWithJWT implements SessionContainerInterface {
    private openIdRecipeImplementation;
    private originalSessionClass;
    constructor(originalSessionClass: SessionContainerInterface, openIdRecipeImplementation: OpenIdRecipeInterface);
    revokeSession: (userContext?: any) => Promise<void>;
    getSessionData: (userContext?: any) => Promise<any>;
    updateSessionData: (newSessionData: any, userContext?: any) => Promise<any>;
    getUserId: (userContext?: any) => string;
    getAccessTokenPayload: (userContext?: any) => any;
    getHandle: (userContext?: any) => string;
    getAccessToken: (userContext?: any) => string;
    getTimeCreated: (userContext?: any) => Promise<number>;
    getExpiry: (userContext?: any) => Promise<number>;
    assertClaims(claimValidators: SessionClaimValidator[], userContext?: any): Promise<void>;
    mergeIntoAccessTokenPayload: (accessTokenPayloadUpdate: any, userContext?: any) => Promise<void>;
    /**
     * @deprecated use mergeIntoAccessTokenPayload instead
     */
    updateAccessTokenPayload: (newAccessTokenPayload: any, userContext?: any) => Promise<void>;
}
