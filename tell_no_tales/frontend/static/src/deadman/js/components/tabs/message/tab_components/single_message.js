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
      finalise_delete_toggle: false
    }
  },
  template: `<div>

              <div class="card card-drop">
                <div class="card-header d-flex" style="dispay:inline; justify-content:space-between">
                  <span>{{messagedata.subject}}</span>
                  <i v-if="!messagedata.expired" class="fas fa-pen"></i>
                </div>
                <div class="card-body">
                  <p class="card-title">{{messagedata.message}}</p>

                  <!-- Expanded area -->
                  <div v-show="expanded_toggle">
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

                    <!-- Modification options -->
                    <div v-if="!messagedata.expired">
                    </div>


                  </div> <!-- End of expanded -->

                  <form class="form-inline" style="justify-content:space-between">
                    <a v-if="!messagedata.expired" class="btn btn-primary">Notify within {{notifyWithin[0]}} {{notifyWithin[1]}}</a>
                    <a v-else>Expired</a>
                    <a v-show="!expanded_toggle" @click="expanded_toggle=true" class="btn btn-outline-primary">Expand</a>
                    <a v-show="expanded_toggle" @click="expanded_toggle=false" class="btn btn-outline-primary">Collapse</a>
                  </form>
                </div>
              </div>
              <!--

              <!-- Expanded area
              <div v-if="expanded_toggle">
                <p>message: {{messagedata.message}}</p>
                <p>sending in: {{ notifyWithin }}</p>
                <p>cutoff in: {{ cutoffIn }}</p>
                <p>recipients: {{ existingRecipients }}</p>
                <div v-if="messagedata.attachments.length > 0">
                  <p>attachments: {{ messagedata.attachments }}</p>
                </div>

                <!-- Modification options
                <div v-if="!messagedata.expired">
                  <button @click="notifyMessage()">Notify me</button>
                  <button :disabled="messagedata.locked" @click="edit_toggle = !edit_toggle">Edit me</button>
                  <button :disabled="!messagedata.deletable" @click="finalise_delete_toggle = true">Delete me</button>
                  <div v-if="finalise_delete_toggle">
                    <p>Are you sure?</p>
                    <button @click="finalise_delete_toggle = false">No</button>
                    <button @click="deleteMessage()">Yes</button>
                  </div>

                  <!-- Editting Options
                  <div v-if="edit_toggle">
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

                    <button @click="finalise_lock_toggle = true">Lock me</button>
                    <div v-if="finalise_lock_toggle">
                      <p>Are you sure?</p>
                      <button @click="updateMessage('make_locked', true); edit_toggle = false">Yes</button>
                      <button @click="finalise_lock_toggle = false">No</button>
                    </div>
                  </div>
                </div>
              </div> -->
            </div>`,
  computed: {
    existingRecipients: function() {
      var existing = [];

      for (var i = 0; i < this.messagedata.recipients.length; i++) {
          existing.push(this.messagedata.recipients[i].name);
        }

      return existing
    },
    isMobile: function() {
      return true
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
