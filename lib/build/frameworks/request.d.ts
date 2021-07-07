import { HTTPMethod } from "../types";
export declare abstract class BaseRequest {
    wrapperUsed: boolean;
    constructor();
    abstract getKeyValueFromQuery: (key: string) => Promise<string | undefined>;
    abstract getJSONBody: () => Promise<any>;
    abstract getMethod: () => HTTPMethod;
    abstract getCookieValue: (key_: string) => string | undefined;
    abstract getHeaderValue: (key: string) => string | undefined;
    abstract getOriginalURL: () => string;
}
