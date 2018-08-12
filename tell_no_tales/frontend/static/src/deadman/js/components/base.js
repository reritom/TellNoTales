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
      logged_in: false,
      new_contact_flag: false
    }
  },
  methods: {
    checkLogin: function() {
      console.log("Sending checkLogin")
      //this.loading = true;
      this.$http.get('/api/login')
          .then((response) => {
            console.log(response);
              console.log(response.data);
                console.log(response.data.data);
          this.logged_in = response.data.data.logged_in;

          if (!this.logged_in) {
            this.view = "settings"
          }

          //this.loading = false;
          })
          .catch((err) => {
           //this.loading = false;
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
                <!--
                <nav class="navbar navbar-dark bg-dark">
                <span class="navbar-brand mb-0 h1">TellNoTales</span>
                </nav>-->



                <nav>
                  <div class="nav-wrapper blue-grey">
                    <a href="#!" class="brand-logo left">No Tales</a>
                    <ul class="right">
                      <li><a><i class="material-icons" v-on:click="view = 'messages'">email</i></a></li>
                      <li><a><i class="material-icons" v-on:click="view = 'contacts'">group</i></a></li>
                      <li><a><i class="material-icons" v-on:click="view = 'settings'">settings</i></a></li>
                    </ul>
                  </div>
                </nav>

                <div v-if="loading" class="progress">
                    <div class="indeterminate"></div>
                </div>

                <div class="tab-container">

                    <div id="ContactsView" v-show="view==='contacts'">
                        <contact-tab v-on:new="new_contact_flag=true"></contact-tab>
                    </div>

                    <div id="SettingsView" v-show="view==='settings'">
                      <settings-tab v-on:logged_in="logged_in = $event"></settings-tab>
                    </div>

                    <div id="MessageView" v-show="view==='messages'">
                      <message-tab :new_contact_flag="new_contact_flag"></message-tab>
                    </div>
                  </div>

                <div class="loading" v-if="loading===true">Loading&#8230;</div>
              </div>`
};
