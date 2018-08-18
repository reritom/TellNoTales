const LoginTab = () => import('./tab_components/login.js');
const LogoutTab = () => import('./tab_components/logout.js');
const ProfileTab = () => import('./tab_components/profile.js');
const SignupTab = () => import('./tab_components/signup.js');

export default {
  name: "SettingsTab",
  components: {
    LoginTab,
    LogoutTab,
    ProfileTab,
    SignupTab
  },
  data: function() {
    return {
      logged_in: false
    }
  },
  template: `<div>
                <login-tab v-if="!logged_in" v-on:login="checkLoginStatus()"></login-tab>
                <signup-tab v-if="!logged_in" v-on:signup="checkLoginStatus()"></signup-tab>
                <profile-tab v-if="logged_in" v-on:logout="checkLoginStatus()"></profile-tab>
                <!--logout-tab v-if="logged_in" v-on:logout="checkLoginStatus()"></logout-tab-->
             </div>`,
  methods: {
    checkLoginStatus() {
      // Check the status, if logged in, show logout and account modification tab, else show login and signup
      this.$http.get('/api/login/')
          .then((response) => {
            console.log(response.data);
            if (response.data.status === true) {
              if (response.data.data.logged_in === true){
                this.logged_in = true;
                this.$emit('logged_in', true);
              }
              else {
                this.logged_in = false;
                this.$emit('logged_in', false);
              }
            }
          })
          .catch((err) => {
           console.log(err);
          })
    }
  },
  created: function() {
    this.checkLoginStatus()
  }
};
