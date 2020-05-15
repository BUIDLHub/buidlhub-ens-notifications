
const DEFAULT_ENDPOINT = 'https://ens.buidlhub.com';

export default class BuidlhubEnsClient {

    constructor(props = {}) {
        const endpoint = props.endpoint || DEFAULT_ENDPOINT;
        this.endpoint = endpoint;
    }

    async addSubscription(publicAddress, emailAddress) {
        return this.getSubscription(publicAddress);
        // return this._post('/addRegistration', {
        //     walletAddress: publicAddress,
        //     emailAddress: emailAddress
        // });
    }

    async getSubscription(publicAddress) {
        return this._post('/lookupRegistration', {
            walletAddress: publicAddress
        });
    }

    async _post(resourcePath, body) {
        const url = this.endpoint + resourcePath;

        const options = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=UTF-8'
            },
            body: JSON.stringify(body)
        };

        const response = await this._fetchWithRetry(url, options);
        return response.json();
    }

    async _fetchWithRetry(url, options, maxAttempts = 3) {
        let lastError = null;
        for (let i = 0; i < maxAttempts; i++) {
            try {
                return await fetch(url, options);
            } catch (error) {
                lastError = error;
                // TODO: log error
            }

            // sleep before retry
            await new Promise(resolve => setTimeout(resolve, 250));
        }
        throw lastError;
    }
}
