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

                  <div class="card">
                    <ul class="list-group list-group-flush">
                      <single-contact v-for="acontact in contactlist" class="list-group-item" :key="acontact.contact_id" :contactdata="acontact" v-on:pulse="$emit('pulse')"></single-contact>
                    </ul>
                  </div>

                    <ul class="collection">

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
