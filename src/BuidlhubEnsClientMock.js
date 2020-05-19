import BuidlhubEnsClient from './BuidlhubEnsClient';

export default class BuidlhubEnsClientMock extends BuidlhubEnsClient {

    constructor(props = {}) {
        super(props);
        this.delay = props.delay || 2000;
    }

    sendResponse(code, data = {}) {
        console.log({ action: 'response', code, data })
        const response = {
            code,
            data
        };
        return Promise.resolve(response)
    }

    async register(resourcePath, body) {
        const record = JSON.stringify(body);
        localStorage.setItem(this.constructor.name, record);
        // foward request
        return this.lookupRegistration(resourcePath, body);
    }

    async lookupRegistration(resourcePath, body) {
        const record = localStorage.getItem(this.constructor.name);
        const data = record ? JSON.parse(record) : {};
        const response = {
            isRegistered: data.walletAddress === body.walletAddress
        };
        return this.sendResponse(200, response);
    }

    async request(resourcePath, body = {}) {
        console.log({ action: 'request', resourcePath, body })
        await new Promise(resolve => setTimeout(resolve, this.delay));

        const parts = resourcePath.split('/').filter(it => it);
        const action = parts.shift();

        if (typeof this[action] !== 'function') {
            return this.sendResponse(404);
        }

        return this[action].call(this, resourcePath, body);
    }


    async _post(resourcePath, body) {
        const response = await this.request(resourcePath, body);
        return response.data;
    }

}
