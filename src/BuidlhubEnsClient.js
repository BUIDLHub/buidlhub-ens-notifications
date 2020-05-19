const DEFAULT_ENDPOINT = 'https://ens.buidlhub.com';

export default class BuidlhubEnsClient {

    constructor(props = {}) {
        const endpoint = props.endpoint || DEFAULT_ENDPOINT;
        this.endpoint = endpoint;
    }

    async addSubscription(props = {}) {
        this._validatePropsExist(props, ['emailAddress', 'publicAddress'])

        const { publicAddress, emailAddress, language } = props;

        return this._post('/register', {
            walletAddress: publicAddress,
            email: emailAddress,
            language
        });
    }

    async getSubscription(props = {}) {
        this._validatePropsExist(props, ['publicAddress'])

        const { publicAddress, language } = props;

        return this._post('/lookupRegistration', {
            walletAddress: publicAddress,
            language
        });
    }

    _validatePropsExist(props, requiredProps) {
        for (const propertyName of requiredProps) {
            const propertyValue = props[propertyName];
            if (!propertyValue) {
                throw new Error(`${propertyName} is required`);
            }
        }
    }

    async _post(resourcePath, body) {
        const url = this.endpoint + resourcePath;

        const options = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=UTF-8',
                'x-referrer': window?.location?.hostname,
            },
            body: JSON.stringify(body)
        };

        const response = await this._fetchWithRetry(url, options);
        const data = response.json();

        if (data.error) {
            throw new Error(error);
        }

        return data;
    }

    async _fetchWithRetry(url, options, maxAttempts = 3) {
        let lastError = null;
        for (let i = 0; i < maxAttempts; i++) {
            try {
                return await fetch(url, options);
            } catch (error) {
                lastError = error;
            }

            // sleep before retry
            await new Promise(resolve => setTimeout(resolve, 250));
        }
        throw lastError;
    }
}
