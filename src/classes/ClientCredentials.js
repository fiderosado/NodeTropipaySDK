export class ClientCredentials {
    constructor(clientId, clientSecret , scopes ,deployMode , tppServerUrl  ) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.scopes = scopes;
        this.deployMode = deployMode;
        this.tppServerUrl = tppServerUrl;
    }
    toObject() {
        return {
            clientId: this.clientId,
            clientSecret: this.clientSecret,
            scopes: this.scopes,
            deployMode : this.deployMode,
            tppServerUrl: this.tppServerUrl
        };
    }
}