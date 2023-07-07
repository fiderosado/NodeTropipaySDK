class TropipayConfig {
    constructor({
                    clientId,
                    clientSecret,
                    scopes,
                    deployMode,
                    tppServerUrl,
                    header,
                    accessToken,
                    refreshToken,
                    token_type,
                    expires_in
                }) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.scopes = scopes;
        this.deployMode = deployMode;
        this.tppServerUrl = tppServerUrl;
        this.header = header;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.token_type = token_type;
        this.expires_in = expires_in;

    }

    toObject() {
        return {
            clientId: this.clientId,
            clientSecret: this.clientSecret,
            scopes: this.scopes,
            deployMode: this.deployMode,
            tppServerUrl: this.tppServerUrl,
            header: this.header,
            accessToken: this.accessToken,
            refreshToken: this.refreshToken,
            token_type: this.token_type,
            expires_in: this.expires_in
        };
    }
}

module.exports = TropipayConfig;
