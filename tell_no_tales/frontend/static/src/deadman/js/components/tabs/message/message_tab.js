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
  props: ['new_contact_flag'],
  data: function () {
    return {
      search_key: "",
      filtered: false,
      messages: [],
      make_new: false
    }
  },
  template: `<div>
              <search-messages v-if="!make_new" v-on:search="search_key = $event"></search-messages>
              <new-message v-if="make_new" v-on:pulse="getMessages" :new_contact_flag="new_contact_flag"></new-message>
              <message-group v-if="!make_new" v-on:pulse="getMessages" :messagelist="filtered_messages" :filtered="filtered"></message-group>

              <div class="fixed-action-btn">
                <a class="btn-floating btn-large blue">
                  <div v-if="!make_new">
                    <i @click="make_new=true" class="large material-icons">add</i>
                  </div>
                  <div v-else>
                    <i @click="make_new=false" class="large material-icons">remove</i>
                  </div>
                </a>
              </div>
            </div>`,
  computed: {filtered_messages: function() {
    // Check to see if search string isn't empty
    if (this.search_key === ""){
      this.filtered = false;
      return this.messages
    }

    this.filtered = true;
    var filtered_messages = [];
    // for each message
    for (var i = 0; i < this.messages.length; i++) {
        // see if the search key exists in any of the searchable elements
        if (this.messages[i].subject.toLowerCase().indexOf(this.search_key.toLowerCase()) != -1){
          filtered_messages.push(this.messages[i]);
        }
        else if (this.messages[i].message.toLowerCase().indexOf(this.search_key.toLowerCase()) != -1){
          filtered_messages.push(this.messages[i]);
        }
        else {
          continue;
        }
    };
    return filtered_messages
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
};
