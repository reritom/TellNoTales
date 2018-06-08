const ContactTab = () => import('./tabs/contact/contact_tab.js');
const MessageTab = () => import('./tabs/message/message_tab.js');
const SettingsTab = () => import('./tabs/settings/settings_tab.js');

export default {
  name: "App",
  components: {
    ContactTab,
    MessageTab,
    SettingsTab
  },
  data: function() {
    return {
      loading: false,
      view: "settings",
      logged_in: false
    }
  },
  methods: {
    checkLogin(){
      console.log("Sending checkLogin")
      this.loading = true;
      this.$http.get('/api/login')
          .then((response) => {
            console.log(response);
              console.log(response.data);
                console.log(response.data.data);
          this.logged_in = response.data.data.logged_in;

          if (!this.logged_in) {
            this.view = "settings"
          }

          this.loading = false;
          })
          .catch((err) => {
           this.loading = false;
           console.log(err);
          })
    }
  },
  watch: {
    view: function() {
      console.log("Watching view");
      this.checkLogin();
    }
  },
  template: `<div>
              <!-- As a heading -->
                <nav class="navbar navbar-dark bg-dark">
                <span class="navbar-brand mb-0 h1">TellNoTales by seres</span>
                </nav>


                <div class="main-tile container">
                    <div class="inner-nav">
                      <button class="inner-nav-item selected" :disabled="!logged_in" v-on:click="view = 'messages'"><i class="fa fa-envelope fa-2x"></i></button>
                      <button class="inner-nav-item not-selected" v-on:click="view = 'settings'"><i class="fa fa-bars fa-2x"></i></button>
                      <button class="inner-nav-item selected" :disabled="!logged_in" v-on:click="view = 'contacts'"><i class="fa fa-users fa-2x"></i></button>
                    </div>

                    <div id="ContactsView" v-if="view==='contacts'">
                        <contact-tab></contact-tab>
                    </div>

                    <div id="SettingsView" v-if="view==='settings'">
                      <settings-tab v-on:logged_in="logged_in = $event"></settings-tab>
                    </div>

                    <div id="MessageView" v-if="view==='messages'">
                      <message-tab></message-tab>
                    </div>
                  </div>

                <div class="loading" v-if="loading===true">Loading&#8230;</div>
              </div>`
};
