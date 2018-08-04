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
              <div @click="expanded_toggle = !expanded_toggle" class="expand-inner-tile-button">{{messagedata.subject}}</div>
              <div v-if="expanded_toggle">
                <p>message: {{messagedata.message}}</p>
                <p>sending in: {{messagedata.notify_within}}</p>
                <p>cutoff in: {{messagedata.cutoff_in}}</p>
                <p>recipients: {{ existingRecipients }}</p>
                <p>attachments: {{ messagedata.attachments }}</p>

                <div v-if="!messagedata.expired">
                  <button @click="notifyMessage()">Notify me</button>
                  <button :disabled="messagedata.locked" @click="edit_toggle = !edit_toggle">Edit me</button>
                  <button :disabled="!messagedata.deletable" @click="finalise_delete_toggle = true">Delete me</button>
                  <div v-if="finalise_delete_toggle">
                    <p>Are you sure?</p>
                    <button @click="finalise_delete_toggle = false">No</button>
                    <button @click="deleteMessage()">Yes</button>
                  </div>

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
    }
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
