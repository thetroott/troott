class Notification {
    client;
    secondaryClient;

    constructor( client: any, secondaryClient?: any ) {
        this.client = client;
        this.secondaryClient = secondaryClient;
    }

    getNotifications( payload: any ) {
        return this.client.get( "/notifications", payload );
    }
}

export default Notification;