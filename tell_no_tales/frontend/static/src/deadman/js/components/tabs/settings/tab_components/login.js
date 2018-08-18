export default {
  name: "LoginTab",
  data: function() {
    return {
      username: "",
      password: ""
    }
  },
  template: `<div class="container">
                <div class="card card-drop">
                  <div class="card-header">
                    Log in
                  </div>
                  <div class="card-body">
                    <div class="form-group>"
                      <input v-model="username"class="form-control"  placeholder="Username">
                      <br>
                      <input v-model="password" class="form-control" type="password" placeholder="Password">
                      <br>
                      <button :disabled="!form_valid" @click="login" class="btn btn-primary btn-block mb-2">Log in</button>
                    </div>
                    <!--
                    <div class="form-inline">
                      <div class="form-group mx-sm-3 mb-2">
                        <label for="inputPassword2" class="sr-only">Password</label>
                        <input type="password" class="form-control" id="inputPassword2" placeholder="Password">
                      </div>
                      <button :disabled="!form_valid" @click="login" class="btn btn-primary mb-2">Confirm identity</button>
                    </div>
                    -->
                  </div>
                </div>
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
