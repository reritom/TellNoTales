const FileHandler = () => import('./file_handler.js');

export default {
  name: "NewMessage",
  components: {
    FileHandler,
  },
  data: function () {
    return {
      expanded_toggle: false,
      loading: false,
      contact_search: "",
      contact_focus: false,
      selection_clicked: false,
      available_contacts: [],
      selected_contacts: [],
      files: [],
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
  template: `<div class="container">
              <button class="btn btn-outline-success my-2 my-sm-0" v-on:click="expanded_toggle = !expanded_toggle">New message</button>

              <div v-if="create_success" class="alert alert-success alert-dismissible fade show" role="alert">
                <p>Your message has been create</p>
                <button @click="create_success = true" type="button" class="close" data-dismiss="alert" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>

              <div v-if="expanded_toggle">
                <p>New message component here</p>

                <!-- Warnings -->
                <div v-for="warning in warnings" class="alert alert-warning alert-dismissible fade show" role="alert">
                  <strong>Uhoh</strong> {{ warning }}
                  <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>


                <div class="form-group">

                  <!-- Contact selection -->
                  <div v-for="contact, index in selected_contacts">
                    <p>List of selected contacts {{ contact.name }}</p>
                    <p @click="removeFromSelectedContacts(index)">Click me to remove from the selected</p>
                  </div>
                  <div >
                    <input class="form-control" ref="contact_search_box" @focus="contact_focus = true" v-model="contact_search" v-on:keyup.enter="onContactEnter" v-on:keyup.tab="contact_focus = false" :placeholder="contact_placeholder">
                    <div v-if="contact_focus">
                      <div v-for="available, index in available_contacts">
                        <p @click="selectionClicked(index)"> {{available.name}} </p>
                      </div>
                    </div>
                  </div>

                  <!-- Subject header -->
                  <div>
                    <input class="form-control" ref="subject_input" @focus="contact_focus = false" v-model="the_subject" placeholder="Your subject">
                  </div>

                  <!-- The message -->
                  <div>
                    <textarea class="form-control" v-model="the_message" placeholder="Your message"></textarea>
                  </div>
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
                <input type="radio" id="locked_false" value="false" v-model="locked">
                <label for="locked_false">Unlocked</label>
                <input type="radio" id="locked_true" value="true" v-model="locked">
                <label for="locked_true">Locked</label>
                <br>

                <!-- File handler -->
                <file-handler v-on:filesadded="files = $event"></file-handler>

                <button @click="createMessage" class="btn btn-primary btn-block mb-2">Create</button>

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
    sendPulse: function() {
      console.log("Sending pulse");
      this.$emit("pulse");
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
                console.log("About to send pulse")
                this.create_success = true;

                this.sendPulse();

                //Close the new message tab
                this.expanded_toggle = false;
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
        form.append("attachments", this.files);

        // append the files to FormData
          Array
            .from(Array(this.files.length).keys())
            .map(x => {
              form.append('attachments', this.files[x], this.files[x].name);
            });

        // Display the key/value pairs
          for (var pair of form.entries()) {
              console.log(pair[0]+ ', ' + pair[1]);
          }

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
};
