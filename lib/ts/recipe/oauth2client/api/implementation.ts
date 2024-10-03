import { APIInterface } from "../";
import Session from "../../session";
import { OAuthTokens } from "../types";

export default function getAPIInterface(): APIInterface {
    return {
        signInPOST: async function (input) {
            const { options, tenantId, userContext, clientId } = input;

            let normalisedClientId = clientId;
            if (normalisedClientId === undefined) {
                if (options.config.providerConfigs.length > 1) {
                    throw new Error(
                        "Should never come here: clientId is undefined and there are multiple providerConfigs"
                    );
                }

                normalisedClientId = options.config.providerConfigs[0].clientId!;
            }
            const providerConfig = await options.recipeImplementation.getProviderConfig({
                clientId: normalisedClientId,
                userContext,
            });

            let oAuthTokensToUse: OAuthTokens = {};

            if ("redirectURIInfo" in input && input.redirectURIInfo !== undefined) {
                oAuthTokensToUse = await options.recipeImplementation.exchangeAuthCodeForOAuthTokens({
                    providerConfig,
                    redirectURIInfo: input.redirectURIInfo,
                    userContext,
                });
            } else if ("oAuthTokens" in input && input.oAuthTokens !== undefined) {
                oAuthTokensToUse = input.oAuthTokens;
            } else {
                throw Error("should never come here");
            }

            const { userId, rawUserInfo } = await options.recipeImplementation.getUserInfo({
                providerConfig,
                oAuthTokens: oAuthTokensToUse,
                userContext,
            });

            const { user, recipeUserId } = await options.recipeImplementation.signIn({
                userId,
                tenantId,
                rawUserInfo,
                oAuthTokens: oAuthTokensToUse,
                userContext,
            });

            const session = await Session.createNewSession(
                options.req,
                options.res,
                tenantId,
                recipeUserId,
                undefined,
                undefined,
                userContext
            );

            return {
                status: "OK",
                user,
                session,
                oAuthTokens: oAuthTokensToUse,
                rawUserInfo,
            };
        },
    };
}
