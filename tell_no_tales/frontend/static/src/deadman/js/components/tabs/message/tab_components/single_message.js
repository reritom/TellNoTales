export default {
  name: "SingleMessage",
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
};
