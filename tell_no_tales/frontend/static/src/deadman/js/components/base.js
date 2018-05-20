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
  template: `<div class="container">

                <button class="btn btn-info" :disabled="!logged_in" v-on:click="view = 'messages'">Messages</button>
                <button class="btn btn-info" :disabled="!logged_in" v-on:click="view = 'contacts'">Contacts</button>
                <button class="btn btn-info" v-on:click="view = 'settings'">Settings</button>

                <div id="ContactsView" v-if="view==='contacts'">
                    <contact-tab></contact-tab>
                </div>

                <div id="SettingsView" v-if="view==='settings'">
                  <settings-tab v-on:logged_in="logged_in = $event"></settings-tab>
                </div>

                <div id="MessageView" v-if="view==='messages'">
                  <message-tab></message-tab>
                </div>

                <div class="loading" v-if="loading===true">Loading&#8230;</div>
              </div>`
};
