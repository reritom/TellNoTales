Vue.component('single-message', {
  props: ['messagedata'],
  template: '<div><h3>This is a single message with subject {{messagedata.subject}}</h3><p>And message {{messagedata.message}}</p></div>'
})

Vue.component('message-group', {
  props: ['messagelist'],
  template: '<div><div v-for="amessage in messagelist"><single-message :messagedata="amessage"></single-message></div></div>'
})

Vue.component('single-contact', {
  props: ['contactdata'],
  template: '<div><h3>This is a single contact with name {{contactdata.name}}</h3><p>And email addresses {{contactdata.email_addresses}}</p></div>'
})

// Create a contact-group component
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
