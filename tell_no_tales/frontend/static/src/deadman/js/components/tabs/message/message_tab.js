const MessageGroup = () => import('./tab_components/message_group.js');
const NewMessage = () => import('./tab_components/new_message.js');
const SearchMessages = () => import('./tab_components/search_messages.js');

export default {
  name: "MessageTab",
  components: {
    SearchMessages,
    NewMessage,
    MessageGroup
  },
  // We capture the search key from the search bar, and use it to filter the messages.
  // The message group receives the filtered list and an indicator to say whether it has been filtered.
  // TODO - If a new message is made, the new message component handles the api request and then emits a
  // .. signal to here saying to re-request the message list.
  //props: ['messages'],
  data: function () {
    return {
      search_key: "",
      filtered: false,
      messages: []
    }
  },
  template: `<div>
              <search-messages v-on:search="search_key = $event"></search-messages>
              <new-message v-on:pulse="getMessages"></new-message>
              <message-group v-on:pulse="getMessages" :messagelist="filtered_messages" :filtered="filtered"></message-group>
            </div>`,
  computed: {filtered_messages: function() {
    // Check to see if search string isn't empty
    if (this.search_key === ""){
      this.filtered = false;
      return this.messages
    }

    this.filtered = true;
    var filtered = [];
    // for each message
    for (var i = 0; i < this.messages.length; i++) {
        // see if the search key exists in any of the searchable elements
        if (this.messages[i].subject.includes(this.search_key.toLowerCase())){
          filtered.push(this.messages[i]);
        }
        else if (this.messages[i].message.includes(this.search_key.toLowerCase())){
          filtered.push(this.messages[i]);
        }
        else {
          continue;
        }
    };
    return filtered
  }},
  methods: {
    getMessages: function() {
      this.loading = true;
      this.$http.get('/api/message/')
          .then((response) => {
            console.log(response);
              console.log(response.data);
                console.log(response.data.data);
          this.messages = response.data.data.messages;
          this.loading = false;
          })
          .catch((err) => {
           this.loading = false;
           console.log(err);
          })
      }
    },
  created: function() {
    this.getMessages();
  }
  // created: call method to get messages
};
