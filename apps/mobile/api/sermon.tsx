import AxiosService from "./core/axios"

class Sermon {
    client;
    secondaryClient;

    constructor(client: any, secondaryClient?: any) {
        this.client = AxiosService;
        this.secondaryClient = secondaryClient;
    }

    getSermons(payload: any) {
        return this.client.call({ type: "default", method: "POST", path: "/sermon/", isAuth: true, payload, });
    }
}

export default Sermon;