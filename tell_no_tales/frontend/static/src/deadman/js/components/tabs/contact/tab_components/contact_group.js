const SingleContact = () => import('./single_contact.js');

export default {
  name: "ContactGroup",
  components: {
    SingleContact
  },
  props: ['contactlist', 'filtered'],
  template: `<div>
              <div v-if="empty_filtered">
                <p>Nothing for your search criteria</p>
              </div>
              <div v-else>
                <ul v-if="contactlist.length > 0">
                  <li v-for="acontact in contactlist">
                    <single-contact :contactdata="acontact" v-on:pulse="$emit('pulse')"></single-contact>
                  </li>
                </ul>
                <div v-else>You have no contacts</div>
              </div>
            </div>`,
    computed: {
      empty_filtered: function(){
        return (this.filtered && this.contactlist.length === 0)
      }
    }
};
