export default {
  name: "ProfileTab",
  data: function() {
    return {
      email_validated: false,
      username: "",
      email: "",
      expand_email_change: false,
      resendClicked: false,
      new_address: "",
      edit_toggle: false,
      profile: {},
    }
  },
  computed: {
    form_valid: function() {
      return this.new_address.length > 5
    }
  },
  template: `<div class="container">
                <div class="card card-drop">
                  <div class="card-header">Hey {{profile.username}}</div>
                  <div class="card-body">

                    <div style="display:flex; justify-content:space-between">
                      <div class="text-primary">Pending messages </div>
                      <div>{{profile.messages_undelivered}}</div>
                    </div>

                    <div style="display:flex; justify-content:space-between">
                      <div class="text-primary">Delivered messages </div>
                      <div>{{profile.messages_delivered}}</div>
                    </div>

                    <div style="display:flex; justify-content:space-between">
                      <div class="text-primary">{{profile.email}}</div>
                      <i v-if="!expand_email_change" class="material-icons text-muted" @click="expand_email_change=true">create</i>
                    </div>

                    <div v-if="expand_email_change">
                      <input class="form-control" v-model="new_address" placeholder="Your new email address">

                      <form class="form-inline" style="justify-content:space-between">
                        <button type="button" @click="updateProfile()" :disabled="!form_valid" class="btn btn-outline-success">Save changes</button>
                        <button type="button" @click="expand_email_change=false" class="btn btn-link">Cancel</button>
                      </form>
                    </div>


                    <div v-if="!email_validated">
                      <p class="text-muted">Your email address hasn't been validated yet, so you can't create contacts or messages</p>

                      <div v-if="resendClicked">
                        <p>We have resent the email, please check your inbox</p>
                      </div>
                      <div v-else>
                        <button @click="triggerResend()" class="btn btn-warning btn-block mb-2">Resend confirmation email</button>
                      </div>
                    </div>

                    <div v-if="!expand_email_change" style="display: flex; justify-content: flex-end">
                      <br>
                      <button type="button" @click="logout()" class="btn btn-link">Logout</button>
                    </div>
                  </div>
                </div>
             </div>`,
  methods: {
    updateProfile() {
      var formData = new FormData();
      formData.append('new_address', this.new_address);

      this.$http.post('/api/profile', formData)
            .then((response) => {
            console.log(response.data);
            if (response.data.status === true) {
              this.edit_toggle = false;
              this.getProfile();
            }
          })
          .catch((err) => {
           console.log(err);
          })

    },
    logout() {
      this.$http.get('/api/logout/')
          .then((response) => {
            console.log(response.data);
            this.$emit('logout');
          })
          .catch((err) => {
           console.log(err);
          })
    },
    triggerResend() {
      this.$http.get('/api/confirm/resend')
            .then((response) => {
              console.log("Retrieving profile");
            console.log(response.data);
            if (response.data.status === true) {
              this.resendClicked = true;
            }
          })
          .catch((err) => {
           console.log(err);
          })
    },
    getProfile() {
      this.$http.get('/api/profile/')
            .then((response) => {
              console.log("Retrieving profile");
            console.log(response.data);
            if (response.data.status === true) {
              this.profile = response.data.data;
              if (response.data.data.validated === true) {
                this.email_validated = true;
              }
              else {
                this.email_validated = false;
              }

              this.username = response.data.data.username;
              this.email = response.data.data.email;
            }
          })
          .catch((err) => {
           console.log(err);
          })
    }
  },
  created: function() {
    this.getProfile();
  }
};
