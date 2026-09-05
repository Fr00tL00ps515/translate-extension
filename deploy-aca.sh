#!/usr/bin/env bash
set -euo pipefail

appid="00f3f603-082f-42a5-806a-5d785375e7a3"
password="${AZ_PASSWORD}"
tenant="007fbe4c-be27-4edb-80c3-329d6a0e2b27"

resource_group="myResourceGroup"
location="germanywestcentral"
acr_name="vladacr"
env_name="myContainerAppEnv"
app_name="extension-container"

echo "try to authenticate..."
az login --service-principal -u $appid -p $password --tenant $tenant
echo "Authenticated successfully with Azure"

# Make sure the Container Apps extension + providers are ready
az extension add --name containerapp --upgrade -y
# az provider register --namespace Microsoft.App --wait
# az provider register --namespace Microsoft.OperationalInsights --wait

echo registred

# ACR (skip if it already exists)
az acr create --resource-group $resource_group --name $acr_name --sku Basic --location $location

az acr login --name $acr_name

acr_server=$(az acr show --name $acr_name --query loginServer -o tsv)

docker build -t ${acr_server}/extension-image:v1 .

docker push ${acr_server}/extension-image:v1
echo "pushed image to acr"

# Container Apps environment (skip if it already exists)
echo "creating container apps environment..."
az containerapp env create \
    --name $env_name \
    --resource-group $resource_group \
    --location $location

echo "deploying the container app"

if az containerapp show --name $app_name --resource-group $resource_group &>/dev/null; then
    # App already exists -> update it
    az containerapp update \
        --name $app_name \
        --resource-group $resource_group \
        --image ${acr_server}/extension-image:v1
else
    # First-time deploy
    az containerapp create \
        --name $app_name \
        --resource-group $resource_group \
        --environment $env_name \
        --image ${acr_server}/extension-image:v1 \
        --target-port 80 \
        --ingress external \
        --registry-server ${acr_server} \
        --registry-username ${appid} \
        --registry-password ${password} \
        --cpu 0.5 --memory 1.0Gi \
        --min-replicas 0 --max-replicas 3
fi

fqdn=$(az containerapp show \
    --name $app_name \
    --resource-group $resource_group \
    --query properties.configuration.ingress.fqdn -o tsv)

echo "deployed! app is available at: https://${fqdn}"