class Subscription {
    client;
    secondaryClient;

    constructor( client: any, secondaryClient?: any ) {
        this.client = client;
        this.secondaryClient = secondaryClient;
    }

    getSubscriptions( payload: any ) {
        return this.client.get( "/subscriptions", payload );
    }
}

export default Subscription;