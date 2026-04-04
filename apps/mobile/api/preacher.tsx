class Preacher {
    client;
    secondaryClient;

    constructor( client: any, secondaryClient?: any ) {
        this.client = client;
        this.secondaryClient = secondaryClient;
    }

    getPreachers( payload: any ) {
        return this.client.get( "/preachers", payload );
    }
}

export default Preacher;