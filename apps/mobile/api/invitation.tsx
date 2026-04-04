class Invitation {
    client;
    secondaryClient;

    constructor( client: any, secondaryClient?: any ) {
        this.client = client;
        this.secondaryClient = secondaryClient;
    }

    getInvitations( payload: any ) {
        return this.client.get( "/invitations", payload );
    }
}

export default Invitation;