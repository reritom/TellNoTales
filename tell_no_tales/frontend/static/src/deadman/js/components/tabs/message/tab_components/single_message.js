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
  template: `<div :class="{'mobile-single-message-main': isMobile, 'desktop-single-message-main': !isMobile}">

              <!-- Unexpanded area -->
              <div @click="expanded_toggle = !expanded_toggle" class="single-message-unexpanded-area-container">
                <div class="single-message-unexpanded-area-child-left" v-if="!messagedata.expired">
                  <div class="single-message-notify-within">{{ notifyWithin[0] }}</div>
                  <div>{{notifyWithin[1]}}</div>
                </div>
                <div class="single-message-unexpanded-area-child-middle">
                  <div v-else>E</div>
                  <div>{{messagedata.subject}}</div>
                </div>
                <div class="single-message-unexpanded-area-child-right">
                  <div v-show="expanded_toggle">Unexp</div>
                  <div v-show="!expanded_toggle">Exp</div>
                </div>
              </div>


              <!-- Expanded area -->
              <div v-if="expanded_toggle">
                <p>message: {{messagedata.message}}</p>
                <p>sending in: {{ notifyWithin }}</p>
                <p>cutoff in: {{ cutoffIn }}</p>
                <p>recipients: {{ existingRecipients }}</p>
                <div v-if="messagedata.attachments.length > 0">
                  <p>attachments: {{ messagedata.attachments }}</p>
                </div>

                <!-- Modification options -->
                <div v-if="!messagedata.expired">
                  <button @click="notifyMessage()">Notify me</button>
                  <button :disabled="messagedata.locked" @click="edit_toggle = !edit_toggle">Edit me</button>
                  <button :disabled="!messagedata.deletable" @click="finalise_delete_toggle = true">Delete me</button>
                  <div v-if="finalise_delete_toggle">
                    <p>Are you sure?</p>
                    <button @click="finalise_delete_toggle = false">No</button>
                    <button @click="deleteMessage()">Yes</button>
                  </div>

                  <!-- Editting Options -->
                  <div v-if="edit_toggle">
                    <div v-if="messagedata.anonymous">
                      <p>anon</p>
                      <button @click="updateMessage('make_anonymous', false)">Unanonymise me</button>
                    </div>
                    <div v-else>
                      <p>nonanon</p>
                      <button @click="updateMessage('make_anonymous', true)">Anonymise me</button>
                    </div>
                    <p>Editting</p>

                    <div v-if="messagedata.viewable">
                      <p>Viewable</p>
                      <button @click="updateMessage('make_hidden', true)">Hide me</button>
                    </div>
                    <div v-else>
                      <p>Not viewable</p>
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
    isMobile: function() {
      return true
    },
    notifyWithin: function() {
      if (this.messagedata.notify.within.days == 0) {
        if (this.messagedata.notify.within.hours == 0) {
          if (this.messagedata.notify.within.minutes == 0) {
            return ['e', 'a few seconds']
          }
          else {
            return [this.messagedata.notify.within.minutes.toString(), ' minutes']
          }
        }
        else {
          return [this.messagedata.notify.within.hours.toString(), ' hours']
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
            return 'a few seconds'
          }
          else {
            return this.messagedata.cutoff.in.minutes.toString() + ' minutes'
          }
        }
        else {
          return this.messagedata.cutoff.in.hours.toString() + ' hours'
        }
      }
      else {
        return this.messagedata.cutoff.in.days.toString() + ' days'
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
