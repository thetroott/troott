class Creator {
    client;
    secondaryClient;

    constructor( client: any, secondaryClient?: any ) {
        this.client = client;
        this.secondaryClient = secondaryClient;
    }

    getCreators( payload: any ) {
        return this.client.get( "/creators", payload );
    }
}

export default Creator;