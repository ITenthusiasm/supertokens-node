import { JSONValue } from "../../../types";
import { SessionClaim, SessionClaimValidator } from "../types";

export abstract class PrimitiveClaim<T extends JSONValue> extends SessionClaim<T> {
    constructor(key: string) {
        super(key);
    }

    abstract fetchValue(userId: string, userContext: any): Promise<T | undefined> | T | undefined;

    addToPayload_internal(payload: any, value: T, _userContext: any): any {
        return {
            ...payload,
            [this.key]: {
                v: value,
                t: Date.now(),
            },
        };
    }
    removeFromPayload(payload: any, _userContext: any): any {
        const res = {
            ...payload,
            [this.key]: null,
        };

        return res;
    }

    getValueFromPayload(payload: any, _userContext?: any): T | undefined {
        return payload[this.key]?.v;
    }

    validators = {
        hasValue: (val: T, id?: string): SessionClaimValidator => {
            return {
                claim: this,
                id: id ?? this.key,
                shouldRefetch: (grantPayload, ctx) => this.getValueFromPayload(grantPayload, ctx) === undefined,
                validate: (grantPayload, ctx) => {
                    const claimVal = this.getValueFromPayload(grantPayload, ctx);
                    const isValid = claimVal === val;
                    return isValid
                        ? { isValid: isValid }
                        : { isValid, reason: { message: "wrong value", expectedValue: val, actualValue: claimVal } };
                },
            };
        },
        hasFreshValue: (val: T, maxAgeInSeconds: number, id?: string): SessionClaimValidator => {
            return {
                claim: this,
                id: id ?? this.key + "-fresh-val",
                shouldRefetch: (grantPayload, ctx) =>
                    this.getValueFromPayload(grantPayload, ctx) === undefined ||
                    // We know grantPayload[this.id] is defined since the value is not undefined in this branch
                    grantPayload[this.key].t < Date.now() - maxAgeInSeconds * 1000,
                validate: (grantPayload, ctx) => {
                    const claimVal = this.getValueFromPayload(grantPayload, ctx);
                    if (claimVal !== val) {
                        return {
                            isValid: false,
                            reason: { message: "wrong value", expectedValue: val, actualValue: claimVal },
                        };
                    }
                    const ageInSeconds = (Date.now() - grantPayload[this.key].t) / 1000;
                    if (ageInSeconds > maxAgeInSeconds) {
                        return {
                            isValid: false,
                            reason: {
                                message: "expired",
                                ageInSeconds,
                                maxAgeInSeconds,
                            },
                        };
                    }
                    return { isValid: true };
                },
            };
        },
    };
}
