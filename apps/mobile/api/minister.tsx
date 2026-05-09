class Minister {
    client;
    secondaryClient;

    constructor(client: any, secondaryClient?: any) {
        this.client = client;
        this.secondaryClient = secondaryClient;
    }

    getMinisters(payload: any) {
        return this.client.get('/minister/list', payload);
    }
}

export default Minister;
