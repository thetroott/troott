class Minister {
    client;
    secondaryClient;

    constructor(client: any, secondaryClient?: any) {
        this.client = client;
        this.secondaryClient = secondaryClient;
    }

    getMinisters(payload: any) {
        return this.client.get('/Ministers', payload);
    }
}

export default Minister;
