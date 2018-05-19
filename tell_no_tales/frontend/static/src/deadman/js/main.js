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
              if (reply_status === true){
                // Alert that it has been made successfully
                this.create_success = true;

                //Close the new message tab
                this.clicked = false;
              }
            })
            .catch((err) => {
               this.loading = false;
               console.log(err);
              })

          },
    createMessage: function() {
      if (this.validateMessage()) {
        //Construct the form
        var form = new FormData();
        form.append("subject", this.the_subject);
        form.append("message", this.the_message);
        form.append("recipients", JSON.stringify(this.selected_contacts));
        form.append("viewable", this.viewable);
        form.append("deletable", this.deletable);
        form.append("locked", this.locked);
        form.append("lifespan", this.lifespan);
        form.append("cutoff", this.cutoff);

        //Send message
        console.log("Creating a message");
        this.sendMessage(form);
        console.log("Finished sending message");

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
  data: function() {
    return {
      expanded_toggle: false,
      delete_toggle: false,
      edit_toggle: false,
      new_addresses: [],
      new_numbers: [],
      deleted_addresses: [],
      deleted_numbers: [],
      loading: false
    }
  },
  template: `<div>
              <p @click="expanded_toggle = !expanded_toggle">name: {{contactdata.name}}</p>

              <div v-if="expanded_toggle">

                <div v-if="contactdata.email_addresses.length">
                  <div v-for="address, index in contactdata.email_addresses">
                    <p>Address is {{address}}</p><p v-if="edit_toggle" @click="removeEmailFromExisting(index)">remove</p>
                  </div>
                </div>

                <div v-else>
                  <p>This contact has no existing addresses</p>
                </div>

                <div v-if="edit_toggle">
                  <div v-for="address, index in new_addresses">
                    <p>New Address is {{address}}</p><p v-if="edit_toggle" @click="removeEmailFromNew(index)">remove</p>
                  </div>
                </div>

                <input ref="email_input" v-if="edit_toggle" placeholder="Add an email">
                <button v-if="edit_toggle" @click="addAddress">Tick</button>

                <p>These are the phone numbers</p>
                <div v-if="contactdata.phone_numbers.length">
                  <div v-for="number, index in contactdata.phone_numbers">
                  <p>Existing number {{number}}</p><p v-if="edit_toggle" @click="removeNumberFromExisting(index)">delete this number</p>
                  </div>
                </div>

                <div v-else>
                  <p>This contact has no current numbers</p>
                </div>

                <div v-if="edit_toggle">
                  <div v-for="number, index in new_numbers">
                    <p>New number {{number}}</p><p v-if="edit_toggle" @click="removeNumberFromNew(index)">remove</p>
                  </div>
                </div>

                <input ref="number_input" v-if="edit_toggle" placeholder="Add a phone number">
                <button v-if="edit_toggle" @click="addNumber">Tick</button>

                <button @click="edit_toggle = !edit_toggle">Edit me</button>

                <div v-if="edit_toggle">
                  <button>Delete me</button>
                </div>

                <button v-if="editted" @click="saveChanges()">Save changes</button>

              </div>
            </div>`,
    methods: {
      saveChanges() {
       var formData = new FormData();

       formData.append('new_addresses', JSON.stringify(this.new_addresses));
       formData.append('new_numbers', JSON.stringify(this.new_numbers));
       formData.append('deleted_numbers', JSON.stringify(this.deleted_numbers));
       formData.append('deleted_addresses', JSON.stringify(this.deleted_addresses));

        this.$http.post('/api/contact/' + this.contactdata.contact_id, formData)
            .then((response) => {
              console.log(response.data);
              this.loading = false;

              //TODO IF status ok, then show success message, else show error
              this.emitRefreshPulse();
              this.edit_toggle = false;

              this.new_numbers = [];
              this.new_addresses = [];
              this.deleted_numbers = [];
              this.deleted_addresses = [];
            })
            .catch((err) => {
             this.loading = false;
             console.log(err);
             this.emitRefreshPulse();
             this.edit_toggle = false;
            })

      },
      addAddress(){
        var value = this.$refs.email_input.value;

        if (value != ""){
          this.new_addresses.push(value);
        }

        this.$refs.email_input.value = "";
      },
      addNumber(){
        var value = this.$refs.number_input.value;

        if (value != ""){
          this.new_numbers.push(value);
        }

        this.$refs.number_input.value = "";
      },
      removeEmailFromExisting(index){
        // Add it to the deleted list
        this.deleted_addresses.push(this.contactdata.email_addresses[index]);

        // Remove from the existing
        Vue.delete(this.contactdata.email_addresses, index);
      },
      removeNumberFromExisting(index){
        // Add it to the deleted list
        this.deleted_numbers.push(this.contactdata.phone_numbers[index]);

        // Remove from the existing
        Vue.delete(this.contactdata.phone_numbers, index);
      },
      removeEmailFromNew(index){
        // Remove from the new
        Vue.delete(this.new_addresses, index);
      },
      removeNumberFromNew(index){
        // Remove from the existing
        Vue.delete(this.new_numbers, index);
      },
      emitRefreshPulse(){
        this.$emit('pulse');
      }
    },
    computed: {
      editted: function() {
        if ((this.new_addresses.length) || (this.new_numbers.length) || (this.deleted_addresses.length)){
          return true
        }
        else {
          return false
        }
      }
    }
})

Vue.component('contact-group', {
  props: ['contactlist', 'filtered'],
  template: `<div>
              <div v-if="empty_filtered">
                <p>Nothing for your search criteria</p>
              </div>
              <div v-else>
                <ul v-if="contactlist.length > 0">
                  <li v-for="acontact in contactlist">
                    <single-contact :contactdata="acontact" v-on:pulse="$emit('pulse')"></single-contact>
                  </li>
                </ul>
                <div v-else>You have no contacts</div>
              </div>
            </div>`,
    computed: {
      empty_filtered: function(){
        return (this.filtered && this.contactlist.length === 0)
      }
    }
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
  data: function() {
    return {
      name: "",
      addresses: [],
      numbers: [],
      expanded_toggle: false
    }
  },
  computed: {
    valid_form: function() {
      return ((this.name != "") && (this.addresses.length > 0 || this.numbers.length > 0 ))
    }
  },
  methods: {
    addEmail() {
      var email = this.$refs.email_input.value;
      if (email != ""){
        this.addresses.push(email);
        this.$refs.email_input.value = "";
      }
    },
    addNumber() {
      var number = this.$refs.number_input.value;
      if (number != ""){
        this.numbers.push(number);
        this.$refs.number_input.value = "";
      }
    },
    removeEmail(index) {
      Vue.delete(this.addresses, index)
    },
    removeNumber(index) {
      Vue.delete(this.numbers, index)
    },
    emitRefreshPulse() {
      this.$emit('pulse');
    },
    createContact() {
      if (this.valid_form) {
        formData = new FormData;

        formData.append('name', this.name);
        formData.append('numbers', JSON.stringify(this.numbers));
        formData.append('addresses', JSON.stringify(this.addresses));

        this.sendContact(formData);

      }
    },
    sendContact(formData) {
      this.$http.post('/api/contact' + formData)
          .then((response) => {
            console.log(response.data);
            this.loading = false;

            //TODO IF status ok, then show success message, else show error
            this.emitRefreshPulse();
            this.edit_toggle = false;

            this.numbers = [];
            this.addresses = [];
            this.name = ""
          })
          .catch((err) => {
           this.loading = false;
           console.log(err);
           this.emitRefreshPulse();
           this.expanded_toggle = false;
          })
    }
  },
  template: `<div>
                <div @click="expanded_toggle = !expanded_toggle">
                  <p>New contact component here</p>
                </div>
                <div v-if="expanded_toggle">
                  <p>This is the expanded part</p>

                  <input v-model="name" placeholder="Add their name">

                  <div v-for="number, index in numbers">
                    <p @click="removeNumber(index)">{{number}}</p>
                  </div>
                  <div>
                    <input ref="number_input" placeholder="Add an number">
                    <button @click="addNumber()">Number tick</button>
                  </div>

                  <div v-for="address, index in addresses">
                    <p @click="removeEmail(index)">{{address}}</p>
                  </div>
                  <div>
                    <input ref="email_input" placeholder="Add an email">
                    <button @click="addEmail()">Email tick</button>
                  </div>

                  <button :disabled="!valid_form" @click="createContact()">save</button>
                </div>
             </div>`
})

Vue.component('contact-tab', {
  data: function() {
    return {
      contacts: [],
      search_key: "",
      filtered: false
    }
  },
  template: `<div>
              <search-contacts v-on:search="search_key = $event"></search-contacts>
              <new-contact v-on:pulse="getContacts()"></new-contact>
              <contact-group :contactlist="filtered_contacts" :filtered="filtered" v-on:pulse="getContacts()"></contact-group>
              <p>Searching for {{ search_key }}</p>
            </div>`,
  created: function() {
    this.getContacts();
  },
  methods: {
    getContacts: function() {
      console.log("Retrieving contacts");
      this.loading = true;
      this.$http.get('/api/contact/')
          .then((response) => {
          this.contacts = response.data.data.contacts;
          this.loading = false;
          })
          .catch((err) => {
           this.loading = false;
           console.log(err);
          })
    }
  },
  computed: {
    filtered_contacts: function() {
      if (this.search_key === ""){
        this.filtered = false;
        return this.contacts
      }

      this.filtered = true;
      var filtered_messages = [];
      // for each message
      for (var i = 0; i < this.contacts.length; i++) {
          // see if the search key exists in any of the searchable elements
          var lower_name = this.contacts[i].name.toLowerCase();
          var lower_key = this.search_key.toLowerCase()

          if (lower_name.indexOf(lower_key) != -1){
            filtered_messages.push(this.contacts[i]);
          }
          else {
            continue;
          }
      };
      return filtered_messages
    }
  }
})

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
  formData.append('username', 'reritom13');
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
