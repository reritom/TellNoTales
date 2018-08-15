const FileHandler = () => import('./file_handler.js');

export default {
  name: "SingleMessage",
  components: {
    FileHandler,
  },
  props: ['messagedata'],
  data: function () {
    return {
      expanded_toggle: false,
      edit_toggle: false,
      finalise_lock_toggle: false,
      finalise_delete_toggle: false,
      modified_subject: "",
      modified_content: ""
    }
  },
  template: `<div>
              <div class="card card-drop">
                <div class="card-header d-flex" style="dispay:inline; justify-content:space-between">
                  <span v-if="!edit_toggle">{{messagedata.subject}}</span>
                  <input v-else :value="messagedata.subject" @input="modified_subject = $event.target.value" class="form-control">

                  <i v-if="showEditToggle" @click="edit_toggle=true" class="fa fa-edit"></i>
                </div>
                <div class="card-body">

                  <div v-if="!edit_toggle"> <!-- Message Body -->
                    <p class="card-title">{{messagedata.message}}</p>
                  </div>
                  <div v-else>
                    <input :value="messagedata.message" @input="modified_content = $event.target.value" class="form-control">
                    <br>
                  </div>

                  <!-- Expanded area -->
                  <div v-show="expanded_toggle && !edit_toggle">
                    <hr>
                    <p v-if="!messagedata.expired" class="card-title">Cutoff in {{cutoffIn[0]}} {{cutoffIn[1]}}</p>

                    <div class="card"> <!-- Recipient cards -->
                      <div class="card-header">
                        This message is for..
                      </div>
                      <ul v-for="recipient in existingRecipients" class="list-group list-group-flush">
                        <li class="list-group-item">{{recipient}}</li>
                      </ul>
                    </div> <!-- End of recipient cards -->

                    <div v-if="messagedata.attachments.length > 0" class="card"> <!-- Attachment cards -->
                      <div class="card-header">
                        This message is for..
                      </div>
                      <ul v-for="attachment in messagedata.attachments" class="list-group list-group-flush">
                        <li class="list-group-item">{{attachment}}</li>
                      </ul>
                    </div> <!-- End of attachment cards -->
                    <br>

                  </div> <!-- End of expanded -->

                  <!-- Modification options -->
                  <div v-if="!messagedata.expired && edit_toggle">

                    <div v-if="messagedata.anonymous">
                      <button @click="updateMessage('make_anonymous', false)">Unanonymise me</button>
                    </div>
                    <div v-else>
                      <button @click="updateMessage('make_anonymous', true)">Anonymise me</button>
                    </div>

                    <div v-if="messagedata.viewable">
                      <button @click="updateMessage('make_hidden', true)">Hide me</button>
                    </div>
                    <div v-else>
                      <button @click="updateMessage('make_hidden', false)">Unhide me</button>
                    </div>

                    <form class="form-inline" style="justify-content:space-between">
                      <button type="button" class="btn btn-outline-danger" v-if="!finalise_lock_toggle" @click="finalise_lock_toggle = true">Lock me</button>
                      <button type="button" class="btn btn-outline-danger" readonly v-else>Are you sure?</button>
                      <div v-if="finalise_lock_toggle">
                        <button type="button" class="btn btn-danger" @click="updateMessage('make_locked', true); edit_toggle = false">Yes</button>
                        <button type="button" class="btn btn-light" @click="finalise_lock_toggle = false">No</button>
                      </div>
                    </form>

                    <br>

                    <form class="form-inline" style="justify-content:space-between">
                      <button type="button" class="btn btn-outline-danger" v-if="!finalise_delete_toggle" :disabled="!messagedata.deletable" @click="finalise_delete_toggle = true">Delete me</button>
                      <button type="button" class="btn btn-outline-danger" readonly v-else>Are you sure?</button>
                      <div v-if="finalise_delete_toggle">
                        <button type="button" class="btn btn-danger" @click="deleteMessage()">Yes</button>
                        <button type="button" class="btn btn-light" @click="finalise_delete_toggle = false">No</button>
                      </div>
                    </form>

                    <br>

                  </div> <!-- End of modification options -->

                  <div v-if="!edit_toggle"> <!-- Options to expand and notify -->
                    <form class="form-inline" style="justify-content:space-between">
                      <button type="button" v-if="messagedata.delivered" class="btn btn-outline-primary">Delivered</button>
                      <button type="button" v-else-if="!messagedata.expired" class="btn btn-outline-warning">Notify within {{notifyWithin[0]}} {{notifyWithin[1]}}</button>
                      <button type="button" v-else class="btn btn-outline-primary">Expired</button>
                      <button type="button" v-show="!expanded_toggle" @click="expanded_toggle=true" class="btn btn-link"><i class="material-icons">expand_more</i></button>
                      <button type="button" v-show="expanded_toggle" @click="expanded_toggle=false" class="btn btn-link"><i class="material-icons">expand_less</i></button>
                    </form>
                  </div>
                  <div v-else> <!-- Options to save changes or cancel -->
                    <form class="form-inline" style="justify-content:space-between">
                      <button type="button" :disabled="!modificationsValid" class="btn btn-outline-success">Save changes</button>
                      <button type="button" @click="edit_toggle=false" class="btn btn-link">Cancel</button>
                    </form>
                  </div>
                </div>
              </div>
            </div>`,
  computed: {
    existingRecipients: function() {
      var existing = [];

      for (var i = 0; i < this.messagedata.recipients.length; i++) {
          existing.push(this.messagedata.recipients[i].name);
        }

      return existing
    },
    showEditToggle: function() {
      if (this.edit_toggle) {
        return false
      }
      else if (this.messagedata.expired || this.messagedata.delivered || this.messagedata.locked) {
        return false
      }
      else {
        return true
      }
    },
    modificationsValid: function() {
      return (this.modified_content.length > 5 && this.modified_subject > 3)
    },
    notifyWithin: function() {
      if (this.messagedata.notify.within.days == 0) {
        if (this.messagedata.notify.within.hours == 0) {
          if (this.messagedata.notify.within.minutes == 0) {
            return ['', 'a few seconds']
          }
          else {
            return [this.messagedata.notify.within.minutes.toString(), 'minutes']
          }
        }
        else {
          return [this.messagedata.notify.within.hours.toString(), 'hours']
        }
      }
      else {
        return [this.messagedata.notify.within.days.toString(), 'days']
      }
    },
    cutoffIn: function() {
      if (this.messagedata.cutoff.in.days == 0) {
        if (this.messagedata.cutoff.in.hours == 0) {
          if (this.messagedata.cutoff.in.minutes == 0) {
            return ['', 'a few seconds']
          }
          else {
            return [this.messagedata.cutoff.in.minutes.toString(), 'minutes']
          }
        }
        else {
          return [this.messagedata.cutoff.in.hours.toString(), 'hours']
        }
      }
      else {
        return [this.messagedata.cutoff.in.days.toString(), 'days']
      }
    },
  },
  methods: {
    updateMessage: function(key, value) {
      var form = new FormData();
      form.append(key, value);

      this.loading = true;
      this.$http.post('/api/message/' + this.messagedata.message_id, form)
          .then((response) => {
            console.log(response.data)
            var reply_status = response.data.status;
            this.loading = false;
            console.log("Reply status is ");
            console.log(reply_status);
            if (reply_status === true){
              console.log("status ok")
              this.$emit("pulse");
            }
          })
          .catch((err) => {
             this.loading = false;
             console.log(err);
            })

    },
    notifyMessage: function() {
      this.loading = true;
      this.$http.get('/api/notify/' + this.messagedata.message_id)
          .then((response) => {
          this.$emit("pulse");
          this.loading = false;
          })
          .catch((err) => {
           this.loading = false;
           console.log(err);
          })
    },
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
};
