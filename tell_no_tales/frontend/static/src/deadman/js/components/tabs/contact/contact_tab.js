const ContactGroup = () => import('./tab_components/contact_group.js');
const NewContact = () => import('./tab_components/new_contact.js');
const SearchContacts = () => import('./tab_components/search_contacts.js');

export default {
  name: "ContactTab",
  components: {
    ContactGroup,
    NewContact,
    SearchContacts
  },
  props: ['search_key'],
  data: function() {
    return {
      contacts: [],
      filtered: false,
      make_new: false
    }
  },
  template: `<div class="container">
              <new-contact v-if="make_new" v-on:pulse="getContacts(); emitNewPulse()"></new-contact>
              <contact-group v-if="!make_new" :contactlist="filtered_contacts" :filtered="filtered" v-on:pulse="getContacts()"></contact-group>
              <button v-if="!make_new" @click="make_new=!make_new" class="btn btn-outline-success static-right-button"><i class="material-icons">add</i></button>
              <button v-else @click="make_new=!make_new" class="btn btn-outline-danger static-right-button"><i class="material-icons">clear</i></button>
            </div>`,
  created: function() {
    this.getContacts();
  },
  methods: {
    emitNewPulse: function() {
      this.$emit('new');
    },
    getContacts: function() {
      console.log("Retrieving contacts");
      this.loading = true;
      this.$http.get('/api/contact/')
          .then((response) => {
          this.contacts = response.data.data.contacts;
          this.loading = false;
          })
          .catch((err) => {
           this.loading = false;
           console.log(err);
          })
    }
  },
  computed: {
    filtered_contacts: function() {
      if (this.search_key === ""){
        this.filtered = false;
        return this.contacts
      }

      this.filtered = true;
      var filtered_contacts = [];
      // for each message
      for (var i = 0; i < this.contacts.length; i++) {
          // see if the search key exists in any of the searchable elements
          var lower_name = this.contacts[i].name.toLowerCase();
          var lower_key = this.search_key.toLowerCase()

          if (lower_name.indexOf(lower_key) != -1){
            filtered_contacts.push(this.contacts[i]);
          }
          else {
            continue;
          }
      };
      return filtered_contacts
    }
  }
};
