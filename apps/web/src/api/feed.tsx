class Feed {
    client;
    secondaryClient;

    constructor( client: any, secondaryClient?: any ) {
        this.client = client;
        this.secondaryClient = secondaryClient;
    }

    getFeeds( payload: any ) {
        return this.client.get( "/feeds", payload );
    }
}

export default Feed;