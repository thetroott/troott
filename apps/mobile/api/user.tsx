class User {
    client;
  
    constructor(client: any) {
      this.client = client;
    }
  
    fetch() {
      return this.client.get("/user");
    }
  
    update(payload: any) {
      return this.client.put("/user", payload);
    }
  
    getAllUsers(payload: any) {
      return this.client.get("/user/allusers", payload);
    }
  }
  
  export default User;
  