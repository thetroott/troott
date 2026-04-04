class Sermon {
    client;
    secondaryClient;

    constructor( client: any, secondaryClient?: any ) {
        this.client = client;
        this.secondaryClient = secondaryClient;
    }

    getSermons( payload: any ) {
        return this.client.get( "/sermons", payload );
    }
}

export default Sermon;