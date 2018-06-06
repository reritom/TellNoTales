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
      filtered: false
    }
  },
  template: `<div>
              <search-contacts v-on:search="search_key = $event"></search-contacts>
              <new-contact v-on:pulse="getContacts()"></new-contact>
              <contact-group :contactlist="filtered_contacts" :filtered="filtered" v-on:pulse="getContacts()"></contact-group>
              <p>Searching for {{ search_key }}</p>
            </div>`,
  created: function() {
    this.getContacts();
  },
  methods: {
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
