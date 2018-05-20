export default {
  name: "LoginTab",
  data: function() {
    return {
      username: "",
      password: ""
    }
  },
  template: `<div>
                <p>This is a login tab</p>
                <input v-model="username" placeholder="Username">
                <input v-model="password" type="password" placeholder="Password">
                <button :disabled="!form_valid" @click="login">Log in</button>
             </div>`,
  methods: {
    login() {
      var formData = new FormData();
       formData.append('username', this.username);
       formData.append('password', this.password);

      this.$http.post('/api/login/', formData)
            .then((response) => {
            console.log(response.data);
            this.password = "";
            this.username = "";
            this.$emit('login');
          })
          .catch((err) => {
           console.log(err);
          })
    }
  },
  computed: {
    form_valid: function() {
      return (this.username != "" && this.password != "")
    }
  }
};
