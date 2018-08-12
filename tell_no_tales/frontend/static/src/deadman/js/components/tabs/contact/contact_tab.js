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
  data: function() {
    return {
      contacts: [],
      search_key: "",
      filtered: false,
      make_new: false
    }
  },
  template: `<div>
              <search-contacts v-if="!make_new" v-on:search="search_key = $event"></search-contacts>
              <new-contact v-if="make_new" v-on:pulse="getContacts(); emitNewPulse()"></new-contact>
              <contact-group v-if="!make_new" :contactlist="filtered_contacts" :filtered="filtered" v-on:pulse="getContacts()"></contact-group>

              <div class="fixed-action-btn">
                <a class="btn-floating btn-large red">
                  <div v-if="!make_new">
                    <i @click="make_new=true" class="large material-icons">add</i>
                  </div>
                  <div v-else>
                    <i @click="make_new=false" class="large material-icons">remove</i>
                  </div>
                </a>
              </div>
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
