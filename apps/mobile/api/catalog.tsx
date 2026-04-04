class Catalog {
    client;
    secondaryClient;

    constructor( client: any, secondaryClient?: any ) {
        this.client = client;
        this.secondaryClient = secondaryClient;
    }

    getCatalogs( payload: any ) {
        return this.client.get( "/catalogs", payload );
    }
}

export default Catalog;