coreVersionXYParam=`echo $1 | tr -d '"'`
coreVersionXY=$coreVersionXYParam

if [ -f "cdi-core-map.json" ]
then
    coreTag=`cat cdi-core-map.json | jq '.["'$coreVersionXYParam'"]' | tr -d '"'`
    if [ "$coreTag" != "null" ]
    then
        coreVersion=$coreTag
        coreVersionXY=$coreTag
    fi
fi

if [ -z "$coreVersion" ]
then
    coreInfo=`curl -s -X GET \
    "https://api.supertokens.io/0/core/latest?password=$SUPERTOKENS_API_KEY&planType=FREE&mode=DEV&version=$1" \
    -H 'api-version: 0'`
    if [[ `echo $coreInfo | jq .tag` == "null" ]]
    then
        echo "fetching latest X.Y.Z version for core, X.Y version: $1, planType: FREE gave response: $coreInfo"
        exit 1
    fi
    coreTag=$(echo $coreInfo | jq .tag | tr -d '"')
    coreVersion=$(echo $coreInfo | jq .version | tr -d '"')
fi

if [ -f "cdi-plugin-interface-map.json" ]
then
    pluginInterfaceTag=`cat cdi-plugin-interface-map.json | jq '.["'$coreVersionXYParam'"]' | tr -d '"'`
    if [ "$pluginInterfaceTag" != "null" ]
    then
        pluginInterfaceVersionXY=$pluginInterfaceTag
        pluginInterfaceVersion=$pluginInterfaceTag
    fi
fi

if [ -z "$pluginInterfaceVersion" ]
then
    pluginInterfaceVersionXY=`curl -s -X GET \
    "https://api.supertokens.io/0/core/dependency/plugin-interface/latest?password=$SUPERTOKENS_API_KEY&planType=FREE&mode=DEV&version=$1" \
    -H 'api-version: 0'`
    if [[ `echo $pluginInterfaceVersionXY | jq .pluginInterface` == "null" ]]
    then
        echo "fetching latest X.Y version for plugin-interface, given core X.Y version: $1, planType: FREE gave response: $pluginInterfaceVersionXY"
        exit 1
    fi
    pluginInterfaceVersionXY=$(echo $pluginInterfaceVersionXY | jq .pluginInterface | tr -d '"')

    pluginInterfaceInfo=`curl -s -X GET \
    "https://api.supertokens.io/0/plugin-interface/latest?password=$SUPERTOKENS_API_KEY&planType=FREE&mode=DEV&version=$pluginInterfaceVersionXY" \
    -H 'api-version: 0'`
    if [[ `echo $pluginInterfaceInfo | jq .tag` == "null" ]]
    then
        echo "fetching latest X.Y.Z version for plugin-interface, X.Y version: $pluginInterfaceVersionXY, planType: FREE gave response: $pluginInterfaceInfo"
        exit 1
    fi
    pluginInterfaceTag=$(echo $pluginInterfaceInfo | jq .tag | tr -d '"')
    pluginInterfaceVersion=$(echo $pluginInterfaceInfo | jq .version | tr -d '"')
fi
echo "Testing with FREE core: $coreVersion, plugin-interface: $pluginInterfaceVersion"

cd ../../
git clone git@github.com:supertokens/supertokens-root.git
cd supertokens-root
if [[ $2 == "2.0" ]] || [[ $2 == "2.1" ]] || [[ $2 == "2.2" ]]
then
    git checkout 36e5af1b9a4e3b07247d0cf333cf82a071a78681
fi
echo -e "core,$coreVersionXY\nplugin-interface,$pluginInterfaceVersionXY" > modules.txt
./loadModules --ssh
cd supertokens-core
git checkout $coreTag

# Update oauth provider config in devConfig.yaml
sed -i 's/# oauth_provider_public_service_url:/oauth_provider_public_service_url: "http:\/\/localhost:4444"/' devConfig.yaml
sed -i 's/# oauth_provider_admin_service_url:/oauth_provider_admin_service_url: "http:\/\/localhost:4445"/' devConfig.yaml
sed -i 's/# oauth_provider_consent_login_base_url:/oauth_provider_consent_login_base_url: "http:\/\/localhost:3001\/auth"/' devConfig.yaml

cd ../supertokens-plugin-interface
git checkout $pluginInterfaceTag
cd ../
echo $SUPERTOKENS_API_KEY > apiPassword
./utils/setupTestEnvLocal
cd ../project/

# Set the script to exit on error
set -e

if ! [[ -z "${CIRCLE_NODE_TOTAL}" ]]; then
    TEST_MODE=testing SUPERTOKENS_CORE_TAG=$coreTag NODE_PORT=8081 INSTALL_PATH=../supertokens-root npx mocha --node-option no-experimental-fetch -r test/fetch-polyfill.mjs --no-config --timeout 500000 $(npx mocha-split-tests -r ./runtime.log -t $CIRCLE_NODE_TOTAL -g $CIRCLE_NODE_INDEX -f 'test/**/*.test.js')
else
    TEST_MODE=testing SUPERTOKENS_CORE_TAG=$coreTag NODE_PORT=8081 INSTALL_PATH=../supertokens-root npm test
fi
