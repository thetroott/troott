class Bite {
    client;
    secondaryClient;
    
    constructor( client: any, secondaryClient?: any ) {
        this.client = client;
        this.secondaryClient = secondaryClient;
    }

    getBite( payload: any ) {
        return this.client.get( "/bites", payload );
    }
}

export default Bite;