export default {
  name: "LogoutTab",
  template: `<div class="container">
                <div class="form-group>"
                  <button @click="logout()" class="btn btn-primary btn-block mb-2">Logout</button>
                </div>
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
