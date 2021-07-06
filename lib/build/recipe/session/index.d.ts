import { BaseRequest, BaseResponse } from "../../frameworks";
import SuperTokensError from "./error";
import {
    VerifySessionOptions,
    RecipeInterface,
    SessionContainerInterface as SessionContainer,
    SessionRequest,
    APIInterface,
    APIOptions,
} from "./types";
import Recipe from "./recipe";
export default class SessionWrapper {
    static init: typeof Recipe.init;
    static Error: typeof SuperTokensError;
    static createNewSession(
        res: BaseResponse,
        userId: string,
        jwtPayload?: any,
        sessionData?: any
    ): Promise<SessionContainer>;
    static getSession(
        req: BaseRequest,
        res: BaseResponse,
        options?: VerifySessionOptions
    ): Promise<SessionContainer | undefined>;
    static refreshSession(req: BaseRequest, res: BaseResponse): Promise<SessionContainer>;
    static revokeAllSessionsForUser(userId: string): Promise<string[]>;
    static getAllSessionHandlesForUser(userId: string): Promise<string[]>;
    static revokeSession(sessionHandle: string): Promise<boolean>;
    static revokeMultipleSessions(sessionHandles: string[]): Promise<string[]>;
    static getSessionData(sessionHandle: string): Promise<any>;
    static updateSessionData(sessionHandle: string, newSessionData: any): Promise<void>;
    static getJWTPayload(sessionHandle: string): Promise<any>;
    static updateJWTPayload(sessionHandle: string, newJWTPayload: any): Promise<void>;
}
export declare let init: typeof Recipe.init;
export declare let createNewSession: typeof SessionWrapper.createNewSession;
export declare let getSession: typeof SessionWrapper.getSession;
export declare let refreshSession: typeof SessionWrapper.refreshSession;
export declare let revokeAllSessionsForUser: typeof SessionWrapper.revokeAllSessionsForUser;
export declare let getAllSessionHandlesForUser: typeof SessionWrapper.getAllSessionHandlesForUser;
export declare let revokeSession: typeof SessionWrapper.revokeSession;
export declare let revokeMultipleSessions: typeof SessionWrapper.revokeMultipleSessions;
export declare let getSessionData: typeof SessionWrapper.getSessionData;
export declare let updateSessionData: typeof SessionWrapper.updateSessionData;
export declare let getJWTPayload: typeof SessionWrapper.getJWTPayload;
export declare let updateJWTPayload: typeof SessionWrapper.updateJWTPayload;
export declare let verifySession: (options?: VerifySessionOptions | undefined) => any;
export declare let Error: typeof SuperTokensError;
export type { VerifySessionOptions, RecipeInterface, SessionContainer, SessionRequest, APIInterface, APIOptions };
