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
  template: `<div>
                <p>This is a signup tab</p>
                <input v-model="username" placeholder="Username">
                <input v-model="email" placeholder="Email">
                <input type="password" v-model="password" placeholder="Password">
                <input type="password" v-model="password2" placeholder="Password (again)">
                <button :disabled="!validForm" @click="CreateAccount()">Create Account</button>
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
