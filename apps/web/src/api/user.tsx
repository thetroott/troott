class User {
    client;

    constructor(client: any) {
        this.client = client;
    }

    getUsers(payload: any) {
        return this.client.get('/user/allusers', payload);
    }

    getUser(payload: any) {
        return this.client.get('/user/allusers', payload);
    }

    updateUser(payload: any) {
        return this.client.put('/user/update', payload);
    }

    getAllUsers(payload: any) {
        return this.client.get('/user/allusers', payload);
    }
}

export default User;
