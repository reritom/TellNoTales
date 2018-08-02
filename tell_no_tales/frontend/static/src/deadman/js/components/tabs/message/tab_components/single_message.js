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
      edit_toggle: false
    }
  },
  template: `<div>
              <div @click="expanded_toggle = !expanded_toggle" class="expand-inner-tile-button">{{messagedata.subject}}</div>
              <div v-if="expanded_toggle">
                <p>message: {{messagedata.message}}</p>
                <p>sending in: {{messagedata.notify_within}}</p>
                <p>cutoff in: {{messagedata.cutoff_in}}</p>
                <p>recipients: {{ messagedata.recipients}}</p>

                <p>{{ messagedata }}</p>

                <div v-if="!messagedata.expired">
                  <button @click="notifyMessage()">Notify me</button>
                  <button :disabled="messagedata.locked" @click="edit_toggle = !edit_toggle">Edit me</button>
                  <button :disabled="!messagedata.deletable" @click="deleteMessage()">Delete me</button>

                </div>
              </div>
            </div>`,
  methods: {
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
