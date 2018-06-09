const SingleMessage = () => import('./single_message.js');

export default {
  name: "MessageGroup",
  components: {
    SingleMessage
  },
  // message list is the potentially filtered message list.
  // filtered is a boolean saying whether the list is filtered or not
  props: ['messagelist', 'filtered'],
  template: `<div>
              <div v-if="not_empty">
                    <button @click="NotifyAll()">Notify All</button>
                    <single-message v-for="amessage in messagelist" v-on:pulse="$emit('pulse')" :messagedata="amessage" :key="amessage.message_id"></single-message>
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
  },
  methods: {
    NotifyAll() {
      this.loading = true;
      this.$http.get('/api/notify/')
          .then((response) => {
          this.$emit("pulse");
          this.loading = false;
          })
          .catch((err) => {
           this.loading = false;
           console.log(err);
          })
    }
  }
};
