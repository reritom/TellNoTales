export default {
  name: "ProfileTab",
  data: function() {
    return {
      email_validated: false,
      username: "",
      email: "",
      resendClicked: false,
      new_address: "",
      edit_toggle: false
    }
  },
  computed: {
    form_valid: function() {
      return this.new_address.length > 0
    }
  },
  template: `<div>
                <p>This is a profile tab</p>
                <p @click="edit_toggle=true">Edit profile</p>

                <div v-if="!edit_toggle">
                  <p>Username: {{username}}</p>
                  <p>Email: {{email}}</p>
                </div>
                <div v-else>
                  <input v-model="new_address" :placeholder="email">
                  <button @click="updateProfile()" :disabled="!form_valid">Save changes</button>
                  <button @click="edit_toggle=false">Cancel</button>
                </div>

                <div v-if="!email_validated">
                  <p>Your email address hasn't been validated yet, so you can't create contacts or messages</p>

                  <div v-if="resendClicked">
                    <p>We have resent the email, please check your inbox</p>
                  </div>
                  <div v-else>
                    <button @click="triggerResend()">Resend confirmation email</button>
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
