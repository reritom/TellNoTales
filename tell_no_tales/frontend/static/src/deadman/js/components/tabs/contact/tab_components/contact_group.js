const SingleContact = () => import('./single_contact.js');

export default {
  name: "ContactGroup",
  components: {
    SingleContact
  },
  props: ['contactlist', 'filtered'],
  template: `<div class="container">

            <div v-if="empty_filtered">
                <p>Nothing for your search criteria</p>
              </div>
              <div v-else>
                <div v-if="contactlist.length > 0">

                    <ul class="collection">
                      <single-contact v-for="acontact in contactlist" :key="acontact.contact_id" :contactdata="acontact" v-on:pulse="$emit('pulse')"></single-contact>
                    </ul>
                </div>
                <div v-else>You have no contacts</div>
              </div>
            </div>`,
    computed: {
      empty_filtered: function(){
        return (this.filtered && this.contactlist.length === 0)
      }
    }
};
