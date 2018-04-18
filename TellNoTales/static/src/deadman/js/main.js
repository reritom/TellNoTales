Vue.component('single-message', {
  props: ['messagedata'],
  template: `<div>
              <h3>This is a single message with subject {{messagedata.subject}}</h3>
              <p>And message {{messagedata.message}}</p>
            </div>`
})

Vue.component('message-group', {
  props: ['messagelist'],
  template: `<div>
              <div v-for="amessage in messagelist">
                <single-message :messagedata="amessage"></single-message>
              </div>
            </div>`
})

Vue.component('search-messages', {
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
  template: `<div>New message component here</div>`
})

Vue.component('message-tab', {
  props: ['messages'],
  data: function () {
    return {
      search_key: ""
    }
  },
  template: `<div>
              <search-messages v-on:search="search_key = $event"></search-messages>
              <new-message></new-message>
              <message-group :messagelist="filtered_messages"></message-group>
              <p>search key is {{this.search_key}}</p>
            </div>`,
  computed: {filtered_messages: function() {
    return this.messages
  }}
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
