Vue.component('single-message', {
  props: ['messagedata'],
  template: `<div>
              <h3>This is a single message with subject {{messagedata.subject}}</h3>
              <p>And message {{messagedata.message}}</p>
            </div>`
})

Vue.component('message-group', {
  // message list is the potentially filtered message list.
  // filtered is a boolean saying whether the list is filtered or not
  props: ['messagelist', 'filtered'],
  template: `<div>
              <div v-if="not_empty">
                <div v-for="amessage in messagelist">
                  <single-message :messagedata="amessage"></single-message>
                </div>
              </div>
              <div v-if="empty_filtered">
                <p>No messages fit this search criteria</p>
              </div>
              <div v-if="empty_not_filtered">
                <p>You have no message history</p>
              </div>
            </div>`,
  computed:{
    not_empty: function() {
      if (this.messagelist.length) {
        return true
      }
      else {
        return false
      }
    },
    empty_filtered: function() {
      if (!this.messagelist.length && this.filtered){
        return true
      }
      else {
        return false
      }
    },
    empty_not_filtered: function() {
      if (!this.messagelist.length && !this.filtered) {
        return true
      }
      else {
        return false
      }
    }
    }
})

Vue.component('search-messages', {
  // A search bar which emits the value of the search
  props: ['noneyet'],
  data: function () {
    return {
      message: ""
    }
  },
  template: `<div>
              <div>Message search bar here</div>
              <input @input="broadcastSearch($event.target.value)" placeholder="edit me">
            </div>`,
  methods: { broadcastSearch(value) {
    this.message = value;
    this.$emit('search', value);
    //console.log(value);
  }}
})

Vue.component('new-message', {
  props: ['noneyet'],
  data: function () {
    return {
      clicked: false,
      loading: false,
      contact_search: "",
      contact_focus: false,
      selected_contacts: [],
      available_contacts: []
      }
  },
  template: `<div>
              <p v-on:click="clicked = !clicked">Create new message</p>
              <div v-if="clicked">
                <p>New message component here</p>
                <div v-for="contact in selected_contacts">
                  <p>List of selected contacts {{ contact.name }}</p>
                </div>
                <input @focus="contact_focus = true" @blur="contact_focus = false" v-model="contact_search" v-on:keyup.enter="onContactEnter" placeholder="Choose a contact or group">
                <p v-if="contact_focus" >There are {{ available_contacts.length }} contacts to choose from</p>
              </div>
              <div v-else>
                <p>Not clicked</p>
              </div>
              <div v-if="loading">
                <p>Am loading</p>
              </div>
            </div>`,
  created: function() {
    // Retrieve the contact list
    this.getContacts();
  },
  methods: {
    getContacts: function() {
      this.loading = true;
      this.$http.get('/api/contact/')
          .then((response) => {
          this.available_contacts = response.data.data.contacts;
          this.loading = false;
          })
          .catch((err) => {
           this.loading = false;
           console.log(err);
          })
    },
    onContactEnter: function() {
      // Get the top of the available list, pop it, and add it to the selected list
      this.selected_contacts.push(this.available_contacts[0])
      this.available_contacts.shift()
    }
  },
  computed: {filtered_contacts: function() {}}
})

Vue.component('message-tab', {
  // We capture the search key from the search bar, and use it to filter the messages.
  // The message group receives the filtered list and an indicator to say whether it has been filtered.
  // TODO - If a new message is made, the new message component handles the api request and then emits a
  // .. signal to here saying to re-request the message list.
  props: ['messages'],
  data: function () {
    return {
      search_key: "",
      filtered: false
    }
  },
  template: `<div>
              <search-messages v-on:search="search_key = $event"></search-messages>
              <new-message></new-message>
              <message-group :messagelist="filtered_messages" :filtered="filtered"></message-group>
              <p>search key is {{this.search_key}}, </p>
            </div>`,
  computed: {filtered_messages: function() {
    // Check to see if search string isn't empty
    if (this.search_key === ""){
      this.filtered = false;
      return this.messages
    }

    this.filtered = true;
    var filtered = [];
    // for each message
    for (var i = 0; i < this.messages.length; i++) {
        // see if the search key exists in any of the searchable elements
        if (this.messages[i].subject.includes(this.search_key.toLowerCase())){
          filtered.push(this.messages[i]);
        }
        else if (this.messages[i].message.includes(this.search_key.toLowerCase())){
          filtered.push(this.messages[i]);
        }
        else {
          continue;
        }
        console.log(this.messages[i].subject);
    };
    return filtered
  }
  // created: call method to get messages
}
})

Vue.component('single-contact', {
  props: ['contactdata'],
  template: `<div>
              <h3>This is a single contact with name {{contactdata.name}}</h3>
              <p>And email addresses {{contactdata.email_addresses}}</p>
            </div>`
})

Vue.component('contact-group', {
  props: ['contactlist'],
  template: `<div>
              <div v-if="contactlist[0]">
                <div v-for="acontact in contactlist">
                  <single-contact :contactdata="acontact"></single-contact>
                </div>
              </div>
              <div v-else>You have no contacts</div>
            </div>`
})

Vue.component('search-contacts', {
  props: ['noneyet'],
  template: `<div>Search bar for contacts be this</div>`
})

Vue.component('new-contact', {
  props: ['noneyet'],
  template: `<div>New contact component here</div>`
})

Vue.component('contact-tab', {
  props: ['contacts'],
  template: `<div>
              <search-contacts></search-contacts>
              <new-contact></new-contact>
              <contact-group :contactlist="contacts"></contact-group>
            </div>`
})
// New message component
// New contact component


new Vue({
  el: '#VueContainer',
  delimiters: ['[[',']]'],
  data: {
  messages: [],
  contacts: [],
  loading: false,
  view: false},
methods: {
  logIn: function() {
 this.loading = true;

   var formData = new FormData();
  formData.append('username', 'tom');
  formData.append('password', 'testpassword');

 this.$http.post('/api/login/', formData)
     .then((response) => {
       console.log(response.data);
       this.loading = false;
     })
     .catch((err) => {
      this.loading = false;
      console.log(err);
     })
},
getMessages: function() {
  this.loading = true;
  this.$http.get('/api/message/')
      .then((response) => {
        console.log(response);
          console.log(response.data);
            console.log(response.data.data);
      this.messages = response.data.data.messages;
      this.loading = false;
      })
      .catch((err) => {
       this.loading = false;
       console.log(err);
      })
},
getContacts: function() {
  this.loading = true;
  this.$http.get('/api/contact/')
      .then((response) => {
        console.log(response);
          console.log(response.data);
            console.log(response.data.data);
      this.contacts = response.data.data.contacts;
      this.loading = false;
      })
      .catch((err) => {
       this.loading = false;
       console.log(err);
      })
}
}
})
