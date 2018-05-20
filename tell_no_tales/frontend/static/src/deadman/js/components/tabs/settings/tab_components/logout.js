export default {
  name: "LogoutTab",
  template: `<div>
                <p>This is a logout tab</p>
                <button @click="logout()">Logout</button>
             </div>`,
  methods: {
    logout() {
      this.$http.get('/api/logout/')
          .then((response) => {
            console.log(response.data);
            this.$emit('logout');
          })
          .catch((err) => {
           console.log(err);
          })
    }
  }
};
