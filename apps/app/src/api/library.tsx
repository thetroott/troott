class Library {
    client;
    secondaryClient;

    constructor( client: any, secondaryClient?: any ) {
        this.client = client;
        this.secondaryClient = secondaryClient;
    }

    getUserLibrary( payload: any ) {
        return this.client.get( "/library", payload );
    }
}

export default Library;