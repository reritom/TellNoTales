const FileHandler = () => import('./file_handler.js');

export default {
  name: "NewMessage",
  components: {
    FileHandler,
  },
  props: ['new_contact_flag'],
  watch: {
    new_contact_flag: function() {
      this.getContacts();
    }
  },
  data: function () {
    return {
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
      create_success: false
      }
  },
  template: `<div class="container">

              <div v-if="create_success" class="alert alert-success alert-dismissible fade show" role="alert">
                <p>Your message has been created</p>
                <button @click="create_success = true" type="button" class="close" data-dismiss="alert" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>

              <!-- Warnings -->
              <div v-for="warning in warnings" class="alert alert-warning alert-dismissible fade show" role="alert">
                <strong>Uhoh</strong> {{ warning }}
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>

              <div class="card card-drop">
                <div class="card-header">
                  <input class="form-control" placeholder="Subject">
                </div>
                <div class="card-body">
                  <textarea class="form-control" v-model="the_message" placeholder="Your message"></textarea>

                  <br>
                  <div style="display: flex; justify-content: space-between;">
                    <p class="text-muted">Your recipients</p>
                    <i class="material-icons text-muted">contacts</i>
                  </div>

                  <!-- Viewable -->
                  <div class="row">
                    <div class="col">
                      <button :class="{'btn mb-2 btn-block':true, 'btn-primary':viewable, 'btn-outline-primary':!viewable}" v-on:click="viewable=true">Viewable</button>
                    </div>
                    <div class="col">
                      <button :class="{'btn mb-2 btn-block':true, 'btn-primary':!viewable, 'btn-outline-primary':viewable}" v-on:click="viewable=false">Hidden</button>
                    </div>
                  </div>
                  <br>

                  <!-- Deletable
                  <div class="row">
                    <div class="col">
                      <button :class="{'btn mb-2 btn-block':true, 'btn-primary':deletable, 'btn-outline-primary':!deletable}" v-on:click="deletable=true">a</button>
                    </div>
                    <div class="col">
                      <button :class="{'btn mb-2 btn-block':true, 'btn-primary':!deletable, 'btn-outline-primary':deletable}" v-on:click="deletable=false">b</button>
                    </div>
                  </div>
                  <br>-->

                  <!-- Locked -->
                  <div class="row">
                    <div class="col">
                      <button :class="{'btn mb-2 btn-block':true, 'btn-primary':!locked, 'btn-outline-primary':locked}" v-on:click="locked=false">Unlocked</button>
                    </div>
                    <div class="col">
                        <button :class="{'btn mb-2 btn-block':true, 'btn-primary':locked, 'btn-outline-primary':!locked}" v-on:click="locked=true">Locked</button>
                    </div>
                  </div>
                  <br>

                  <!-- File handler
                  <file-handler v-on:filesadded="files = $event"></file-handler>
                  -->

                  <form class="form-inline" style="justify-content:space-between">
                    <button type="button" class="btn btn-outline-success">Create</button>
                    <button type="button" @click="createMessage" class="btn btn-link">Cancel</button>
                  </form>
                </div>
              </div>


              <div class="form-group">

                <!-- Contact selection removal -->
                <div v-for="contact, index in selected_contacts" :key="contact.contact_id">
                  <div class="input-group">
                    <div class="input-group-prepend">
                      <span class="input-group-text" id="basic-addon1">Contact</span>
                    </div>
                    <input type="text" readonly class="form-control" readonly :placeholder="contact.name" aria-label="Email" aria-describedby="basic-addon1">
                    <div class="input-group-append">
                      <span class="input-group-text" id="basic-addon1" @click="removeFromSelectedContacts(index)">Deselect</span>
                    </div>
                  </div>
                </div>

                <!-- Contact selection -->
                <div>

                  <!-- Main selection search bar -->
                  <div class="input-group">
                    <div class="input-group-prepend">
                      <span class="input-group-text" id="basic-addon1">{{selected_contacts.length}} selected</span>
                    </div>
                    <input class="form-control" ref="contact_search_box" @focus="contact_focus = true" v-model="contact_search" v-on:keyup.enter="onContactEnter" v-on:keyup.tab="contact_focus = false" :placeholder="contact_placeholder">
                    <div class="input-group-append">
                      <span class="input-group-text" id="basic-addon3" >Deselect All</span>
                    </div>
                  </div>

                  <div v-if="contact_focus">
                    <div v-for="available, index in filtered_available_contacts" :key="available.contact_id">
                      <div class="input-group">
                        <div class="input-group-prepend">
                          <span class="input-group-text" id="basic-addon1">Contact</span>
                        </div>
                        <input readonly type="text" class="form-control" :placeholder="available.name" aria-label="Email" aria-describedby="basic-addon3">
                        <div class="input-group-append">
                          <span class="input-group-text" id="basic-addon3" @click="selectionClicked(index)">Select</span>
                        </div>
                      </div>
                    </div>
                  </div>
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
    resetChanges: function() {
      this.selected_contacts = [];
      this.message = "";
      this.subject = "";
    },
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
                this.resetChanges();

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
      if (this.filtered_available_contacts.length > 0) {
        this.selected_contacts.push(this.filtered_available_contacts[0]);
        //this.available_contacts.shift();
      }
      else {
        // Else, focus on the next input
        this.$refs.subject_input.focus();
      }
    },
    selectionClicked: function(index) {
      this.selected_contacts.push(this.filtered_available_contacts[index]);
      //this.available_contacts.shift();
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
      //this.available_contacts.push(this.selected_contacts[index]);
      Vue.delete(this.selected_contacts, index);
      // Refocus on the input box
      this.$refs.contact_search_box.focus();
    }
  },
  computed: {
    filtered_available_contacts: function() {
      var filtered_list = [];

      for (var i = 0; i < this.available_contacts.length; i++) {
        if (this.selected_contacts.indexOf(this.available_contacts[i]) == -1){
          filtered_list.push(this.available_contacts[i]);
        }
      }
      return filtered_list
    },
    contact_placeholder: function() {
      if (this.selected_contacts.length > 0) {
        return "Add another contact"
      }
      else {
        return "Add some contacts"
      }
      }
    }
};
