class Search {
    client;
    secondaryClient;

    constructor( client: any, secondaryClient?: any ) {
        this.client = client;
        this.secondaryClient = secondaryClient;
    }

    getSearchs( payload: any ) {
        return this.client.get( "/searchs", payload );
    }
}

export default Search;