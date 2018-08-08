export default {
  name: "ProfileTab",
  data: function() {
    return {
      email_validated: false,
      username: "",
      email: "",
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
                <p>This is a profile tab</p>

                <div v-if="!edit_toggle">
                  <p>Username: {{profile.username}}</p>
                  <p>Email: {{profile.email}}</p>
                  <p>Messages delivered: {{profile.messages_delivered}}</p>
                  <p>Pending messages: {{profile.messages_undelivered}}</p>
                </div>

                <div v-else>
                  <!--<input v-model="new_address" :placeholder="email">-->

                  <div class="form-group">
                    <div class="input-group">
                      <div class="input-group-prepend">
                        <span class="input-group-text" id="basic-addon1">@</span>
                      </div>
                      <input v-model="new_address" type="text" class="form-control" :placeholder="profile.email" aria-label="Email" aria-describedby="basic-addon3">
                    </div>
                  </div>

                  <div class="form-inline">
                    <button @click="updateProfile()" :disabled="!form_valid" class="btn btn-success mb-2">Save changes</button>
                    <button @click="edit_toggle=false" class="btn btn-error mb-2">Cancel</button>
                  </div>

                </div> <!-- End of edit toggle else -->
                <p v-if="!edit_toggle" @click="edit_toggle=true"class="btn btn-primary mb-2">Edit profile</p>

                <div v-if="!email_validated">
                  <p>Your email address hasn't been validated yet, so you can't create contacts or messages</p>

                  <div v-if="resendClicked">
                    <p>We have resent the email, please check your inbox</p>
                  </div>
                  <div v-else>
                    <button @click="triggerResend()" class="btn btn-warning btn-block mb-2">Resend confirmation email</button>
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
