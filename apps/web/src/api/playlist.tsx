class Playlist {
    client;
    secondaryClient;

    constructor( client: any, secondaryClient?: any ) {
        this.client = client;
        this.secondaryClient = secondaryClient;
    }

    getPlaylists( payload: any ) {
        return this.client.get( "/playlists", payload );
    }
}

export default Playlist;