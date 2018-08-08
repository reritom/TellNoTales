export default {
  name: "SignupTab",
  data: function() {
    return {
      username: "",
      email: "",
      password: "",
      password2: ""
    }
  },
  template: `<div class="container">
                <div class="form-group>"
                  <p>This is a signup tab</p>
                  <input v-model="username" class="form-control" placeholder="Username">
                  <input v-model="email" class="form-control" placeholder="Email">
                  <input type="password" v-model="password" class="form-control" placeholder="Password">
                  <input type="password" v-model="password2" class="form-control" placeholder="Password (again)">
                  <button :disabled="!validForm" @click="CreateAccount()" class="btn btn-primary btn-block mb-2">Create Account</button>
                </div>
             </div>`,
  computed: {
    validForm() {
      if ((this.username.length < 5 ) || (this.password < 5) || (this.password != this.password2)) {
        return false
      }
      else {
        return true
      }
    }
  },
  methods: {
    CreateAccount() {
      if (!this.validForm) {
        return false
      }

      var formData = new FormData();
       formData.append('username', this.username);
       formData.append('email', this.email)
       formData.append('password', this.password);

      this.$http.post('/api/signup/', formData)
            .then((response) => {
            console.log(response.data);
            this.password = "";
            this.password2 = "";
            this.username = "";
            this.email = "";

            this.$emit('signup');
          })
          .catch((err) => {
           console.log(err);
          })
    }
  }
};
