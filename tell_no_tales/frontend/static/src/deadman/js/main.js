Vue.component('single-message', {
  props: ['messagedata'],
  template: `<div>
              <p>subject: {{messagedata.subject}}</p>
              <p>message: {{messagedata.message}}</p>
              <p>recipients: {{ messagedata.recipients}}</p>
              <button @click="deleteMessage()">Delete me</button>
            </div>`,
  methods: {
    deleteMessage: function() {
      var message_id = this.messagedata.message_id;
      var url = "/api/message/" + message_id;
      console.log("Url is " + url);

      this.loading = true;
      this.$http.delete(url)
          .then((response) => {
            console.log("Response is " + response);
            console.log(response.data);
            var reply_status = response.data.status;
            this.loading = false;
            this.$emit("pulse");
          })
          .catch((err) => {
           this.loading = false;
           console.log(err);
          })
    }
  }
})

Vue.component('message-group', {
  // message list is the potentially filtered message list.
  // filtered is a boolean saying whether the list is filtered or not
  props: ['messagelist', 'filtered'],
  template: `<div>
              <div v-if="not_empty">
                <ul>
                  <li v-for="amessage in messagelist">
                    <single-message v-on:pulse="$emit('pulse')" :messagedata="amessage"></single-message>
                  </li>
                </ul>
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
              <input @input="broadcastSearch($event.target.value)" placeholder="Search messages">
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
      selection_clicked: false,
      available_contacts: [],
      selected_contacts: [],
      the_message: "",
      the_subject: "",
      cutoff: "10",
      lifespan: "5",
      deletable: true,
      locked: false,
      viewable: true,
      warnings: [],
      create_success: false,
      message_id: ""
      }
  },
  template: `<div>
              <p v-on:click="clicked = !clicked">Create new message</p>

              <div v-if="create_success" class="alert alert-success alert-dismissible fade show" role="alert">
                <p>Your message has been create</p>
                <button @click="create_success = true" type="button" class="close" data-dismiss="alert" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>

              <div v-if="clicked">
                <p>New message component here</p>

                <!-- Warnings -->
                <div v-for="warning in warnings" class="alert alert-warning alert-dismissible fade show" role="alert">
                  <strong>Uhoh</strong> {{ warning }}
                  <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>

                <!-- Contact selection -->
                <div v-for="contact, index in selected_contacts">
                  <p>List of selected contacts {{ contact.name }}</p>
                  <p @click="removeFromSelectedContacts(index)">Click me to remove from the selected</p>
                </div>
                <div >
                  <input ref="contact_search_box" @focus="contact_focus = true" v-model="contact_search" v-on:keyup.enter="onContactEnter" v-on:keyup.tab="contact_focus = false" :placeholder="contact_placeholder">
                  <div v-if="contact_focus">
                    <div v-for="available, index in available_contacts">
                      <p @click="selectionClicked(index)"> {{available.name}} </p>
                    </div>
                  </div>
                </div>

                <!-- Subject header -->
                <div>
                  <input ref="subject_input" @focus="contact_focus = false" v-model="the_subject" placeholder="Your subject">
                </div>

                <!-- The message -->
                <div>
                  <textarea v-model="the_message" placeholder="Your message"></textarea>
                </div>

                <!-- Viewable -->
                <input type="radio" id="viewable_true" value="true" v-model="viewable">
                <label for="viewable_true">Viewable</label>
                <input type="radio" id="viewable_false" value="false" v-model="viewable">
                <label for="viewable_false">Hidden</label>
                <br>

                <!-- Deletable -->
                <input type="radio" id="deletable_true" value="true" v-model="deletable">
                <label for="deletable_true">Deletable</label>
                <input type="radio" id="deletable_false" value="false" v-model="deletable">
                <label for="deletable_false">Undeletable</label>
                <br>

                <!-- Locked -->
                <input type="radio" id="locked_false" value="true" v-model="viewable">
                <label for="locked_false">Unlocked</label>
                <input type="radio" id="locked_true" value="false" v-model="viewable">
                <label for="locked_true">Locked</label>
                <br>

                <button @click="createMessage">Create</button>

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
    sendPulse() {
      console.log("Sending pulse");
      this.$emit("pulse");
    },
    sendMessageAddRecipient(contact_id){
      var form = new FormData();
      form.append("recipient", contact_id);
      form.append("mode", "UPDATE");
      console.log("Url is /api/message/" + this.message_id);
      this.loading = true;
      this.$http.post('/api/message/' + this.message_id, form)
          .then((response) => {
            console.log(response.data);
            var reply_status = response.data.status;
            this.loading = false;

            if (reply_status){
              console.log("Status OK for adding recipient");
              return true
              }
            else {
              return false
            }
          })
          .catch((err) => {
           this.loading = false;
           console.log(err);
           return false
          })

    },
    sendMessage: function(form) {
        console.log("In send message promise");
        this.loading = true;
        this.$http.post('/api/message/', form)
            .then((response) => {
              console.log(response.data)
              var reply_status = response.data.status;
              this.loading = false;
              console.log("Reply status is ");
              console.log(reply_status);

              if (reply_status){
                  console.log("Returning true")
                  console.log(response.data.data.message.message_id);
                  this.message_id = response.data.data.message.message_id;
                  console.log(this.message_id);

                  console.log("For remaining recipients");
                  for (var i=0; i<this.selected_contacts.length; i++){
                      console.log(i);
                      this.sendMessageAddRecipient(this.selected_contacts[i].contact_id);
                    }

                  console.log("before send pulse");
                  //Send a pulse so that the message tab knows to update the message list
                  this.sendPulse();
                  console.log("after send pulse");
                }
              else {
                console.log("Reply status KO");
              }
            })
            .catch((err) => {
               this.loading = false;
               console.log(err);
              })

          },
    createMessage: function() {
      if (this.validateMessage()) {
        // API LIMITATION. ONLY 1 CONTACT IN CREATE_MESSAGE, the others need to be added in seperate requests

        console.log(this.selected_contacts[0].contact_id);

        //Construct the form
        var form = new FormData();
        form.append("subject", this.the_subject);
        form.append("message", this.the_message);
        form.append("recipient", this.selected_contacts[0].contact_id);
        this.selected_contacts.shift();
        form.append("viewable", this.viewable);
        form.append("deletable", this.deletable);
        form.append("locked", this.locked);
        form.append("lifespan", this.lifespan);
        form.append("cutoff", this.cutoff);

        //Send message
        console.log("Creating a message");
        this.sendMessage(form);
        console.log("Finished sending message");

        // Alert that it has been made successfully
        this.create_success = true;

        //Close the new message tab
        this.clicked = false;

      }
      else {
        //Error message
        console.log("Not sending message, invalid");
      }
    },
    validateMessage: function() {
      this.warnings = [];
      var flag = true;

      if (!this.the_subject.length){
        flag = false;
        this.warnings.push("Subject is empty");
      }
      if (!this.the_message.length){
        flag = false;
        this.warnings.push("Message is empty");
      }
      if (!this.selected_contacts.length){
        flag = false;
        this.warnings.push("You haven't selected any contacts");
      }
       console.log("Message validated as ");
       console.log(flag);

      return flag
    },
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
      // If there are available_contacts
      // Get the top of the available list, pop it, and add it to the selected list
      if (this.available_contacts.length > 0) {
        this.selected_contacts.push(this.available_contacts[0]);
        this.available_contacts.shift();
      }
      else {
        // Else, focus on the next input
        this.$refs.subject_input.focus();
      }
    },
    selectionClicked: function(index) {
      this.selected_contacts.push(this.available_contacts[index]);
      this.available_contacts.shift();
      this.selection_clicked = true;
       // Refocus on the input box
       this.$refs.contact_search_box.focus();
    },
    checkFocus: function() {
      // Called when input goes out of focus.
      // If a suggestion was clicked, keep the list in focus
      // else, hide the list
      if (this.selection_clicked === true) {
        console.log("Selection was clicked");
        this.selection_clicked = false;
        this.contact_focus = true;
      }
      else {
        console.log("Something else was clicked");
        this.contact_focus = false;
      }

    },
    removeFromSelectedContacts: function(index) {
      // Remove from selected, and add to available
      this.available_contacts.push(this.selected_contacts[index]);
      Vue.delete(this.selected_contacts, index);
    }
  },
  computed: {filtered_contacts: function() {},
            contact_placeholder: function() {
              if (this.selected_contacts.length > 0) {
                return "Add another contact"
              }
              else {
                return "Add some contacts"
              }
            }}
})

Vue.component('message-tab', {
  // We capture the search key from the search bar, and use it to filter the messages.
  // The message group receives the filtered list and an indicator to say whether it has been filtered.
  // TODO - If a new message is made, the new message component handles the api request and then emits a
  // .. signal to here saying to re-request the message list.
  //props: ['messages'],
  data: function () {
    return {
      search_key: "",
      filtered: false,
      messages: []
    }
  },
  template: `<div>
              <search-messages v-on:search="search_key = $event"></search-messages>
              <new-message v-on:pulse="getMessages"></new-message>
              <message-group v-on:pulse="getMessages" :messagelist="filtered_messages" :filtered="filtered"></message-group>
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
    };
    return filtered
  }},
  methods: {
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
      }
    },
  created: function() {
    this.getMessages();
  }
  // created: call method to get messages
})

Vue.component('single-contact', {
  props: ['contactdata'],
  template: `<div>
              <p>name: {{contactdata.name}}</p>
              <p>email addresses: {{contactdata.email_addresses}}</p>
            </div>`
})

Vue.component('contact-group', {
  props: ['contactlist'],
  template: `<div>
              <ul v-if="contactlist[0]">
                <li v-for="acontact in contactlist">
                  <single-contact :contactdata="acontact"></single-contact>
                </li>
              </ul>
              <div v-else>You have no contacts</div>
            </div>`
})

Vue.component('search-contacts', {
  props: ['noneyet'],
  data: function() {
    return {
      message: ""
    }
  },
  template: `<div>
              <input @input="broadcastSearch($event.target.value)" placeholder="Search contacts">
            </div>`,
  methods: { broadcastSearch(value) {
    this.message = value;
    this.$emit('search', value);
    //console.log(value);
  }}
})

Vue.component('new-contact', {
  props: ['noneyet'],
  template: `<div>New contact component here</div>`
})

Vue.component('contact-tab', {
  data: function() {
    return {
      contacts: [],
      search: ""
    }
  },
  template: `<div>
              <search-contacts v-on:search="search = $event"></search-contacts>
              <new-contact></new-contact>
              <contact-group :contactlist="contacts"></contact-group>
              <p>Searching for {{ search }}</p>
            </div>`,
  created: function() {
    this.getContacts();
  },
  methods: {
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
// New message component
// New contact component


new Vue({
  el: '#VueContainer',
  delimiters: ['[[',']]'],
  data: {
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
}

}
})
