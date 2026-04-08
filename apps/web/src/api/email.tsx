class Email {
    client;
    secondaryClient;

    constructor( client: any, secondaryClient?: any ) {
        this.client = client;
        this.secondaryClient = secondaryClient;
    }

    getEmails( payload: any ) {
        return this.client.get( "/emails", payload );
    }
}

export default Email;