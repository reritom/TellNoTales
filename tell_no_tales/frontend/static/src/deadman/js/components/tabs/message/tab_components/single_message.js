export default {
  name: "SingleMessage",
  props: ['messagedata'],
  data: function () {
    return {
      expanded_toggle: false
    }
  },
  template: `<div>
              <div @click="expanded_toggle = !expanded_toggle" class="expand-inner-tile-button">{{messagedata.subject}}</div>
              <div v-if="expanded_toggle">
                <p>message: {{messagedata.message}}</p>
                <p>recipients: {{ messagedata.recipients}}</p>
              </div>
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
};
