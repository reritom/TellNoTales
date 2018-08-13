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
      new_contact_flag: false,
      search: ""
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
  computed: {
    isContacts: function() {
      return (this.view == 'contacts')
    },
    isMessages: function() {
      return (this.view == 'messages')
    },
    isSettings: function() {
      return (this.view == 'settings')
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
                <nav class="navbar navbar-expand-lg navbar-light bg-light">
                  <a class="navbar-brand" href="#">No tales</a>
                  <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarTogglerDemo02" aria-controls="navbarTogglerDemo02" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                  </button>

                  <div class="collapse navbar-collapse" id="navbarTogglerDemo02">
                    <ul class="navbar-nav mr-auto mt-2 mt-lg-0">
                      <li :class="{'nav-item':true, 'active':isMessages}">
                        <a class="nav-link" v-on:click="view = 'messages'">Message</a>
                      </li>
                      <li :class="{'nav-item':true, 'active':isContacts}">
                        <a class="nav-link" v-on:click="view = 'contacts'">Contacts</a>
                      </li>
                      <li :class="{'nav-item':true, 'active':isSettings}">
                        <a class="nav-link" v-on:click="view = 'settings'">Account</a>
                      </li>
                    </ul>

                    <br>

                    <div class="col-sm-3 col-md-3 pull-right">
                      <form class="navbar-form" role="search">
                        <div class="input-group">
                            <input type="text" v-model="search" class="form-control" placeholder="Search" name="srch-term" id="srch-term">
                            <span class="input-group-append">
                                  <div class="input-group-text bg-transparent">
                                  <i v-if="search == ''" class="fa fa-search"></i>
                                  <i v-else @click="search=''" class="fa fa-times"></i>
                                  </div>
                            </span>
                        </div>
                      </form>
                    </div>
                  </div>
                </nav>




                <div class="tab-container">

                    <div id="ContactsView" v-show="view==='contacts'">
                        <contact-tab v-on:new="new_contact_flag=true" :search_key="search"></contact-tab>
                    </div>

                    <div id="SettingsView" v-show="view==='settings'">
                      <settings-tab v-on:logged_in="logged_in = $event"></settings-tab>
                    </div>

                    <div id="MessageView" v-show="view==='messages'">
                      <message-tab :new_contact_flag="new_contact_flag" :search_key="search"></message-tab>
                    </div>
                  </div>

                <div class="loading" v-if="loading===true">Loading&#8230;</div>
              </div>`
};
