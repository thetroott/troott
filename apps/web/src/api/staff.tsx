class Staff {
    client;
    secondaryClient;

    constructor( client: any, secondaryClient?: any ) {
        this.client = client;
        this.secondaryClient = secondaryClient;
    }

    getStaffs( payload: any ) {
        return this.client.get( "/staffs", payload );
    }
}

export default Staff;