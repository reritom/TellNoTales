export default {
  name: "SingleContact",
  props: ['contactdata'],
  data: function() {
    return {
      expanded_toggle: false,
      delete_toggle: false,
      edit_toggle: false,
      finalise_delete_toggle: false,
      new_addresses: [],
      new_numbers: [],
      deleted_addresses: [],
      deleted_numbers: [],
      loading: false
    }
  },
  template: `<div class="inner-tile">
              <p @click="expanded_toggle = !expanded_toggle">name: {{contactdata.name}}</p>

              <div v-if="expanded_toggle">

                <div v-if="contactdata.email_addresses.length">
                  <div v-for="address, index in contactdata.email_addresses">
                    <p>Address is {{address}}</p><p v-if="edit_toggle" @click="removeEmailFromExisting(index)">remove</p>
                  </div>
                </div>

                <div v-else>
                  <p>This contact has no existing addresses</p>
                </div>

                <div v-if="edit_toggle">
                  <div v-for="address, index in new_addresses">
                    <p>New Address is {{address}}</p><p v-if="edit_toggle" @click="removeEmailFromNew(index)">remove</p>
                  </div>
                </div>

                <input ref="email_input" v-if="edit_toggle" placeholder="Add an email">
                <button v-if="edit_toggle" @click="addAddress">Tick</button>

                <p>These are the phone numbers</p>
                <div v-if="contactdata.phone_numbers.length">
                  <div v-for="number, index in contactdata.phone_numbers">
                  <p>Existing number {{number}}</p><p v-if="edit_toggle" @click="removeNumberFromExisting(index)">delete this number</p>
                  </div>
                </div>

                <div v-else>
                  <p>This contact has no current numbers</p>
                </div>

                <div v-if="edit_toggle">
                  <div v-for="number, index in new_numbers">
                    <p>New number {{number}}</p><p v-if="edit_toggle" @click="removeNumberFromNew(index)">remove</p>
                  </div>
                </div>

                <input ref="number_input" v-if="edit_toggle" placeholder="Add a phone number">
                <button v-if="edit_toggle" @click="addNumber">Tick</button>

                <button @click="edit_toggle = !edit_toggle">Edit me</button>

                <div>
                  <button :disabled="!contactdata.deletable" @click="finalise_delete_toggle = true">Delete me</button>
                  <div v-if="finalise_delete_toggle">
                    <p>Are you sure?</p>
                    <button @click="finalise_delete_toggle = false">No</button>
                    <button @click="deleteContact()">Yes</button>
                  </div>
                </div>

                <button v-if="editted" @click="saveChanges()">Save changes</button>

              </div>
            </div>`,
    methods: {
      saveChanges() {
       var formData = new FormData();

       formData.append('new_addresses', JSON.stringify(this.new_addresses));
       formData.append('new_numbers', JSON.stringify(this.new_numbers));
       formData.append('deleted_numbers', JSON.stringify(this.deleted_numbers));
       formData.append('deleted_addresses', JSON.stringify(this.deleted_addresses));

        this.$http.post('/api/contact/' + this.contactdata.contact_id, formData)
            .then((response) => {
              console.log(response.data);
              this.loading = false;

              //TODO IF status ok, then show success message, else show error
              this.emitRefreshPulse();
              this.edit_toggle = false;

              this.new_numbers = [];
              this.new_addresses = [];
              this.deleted_numbers = [];
              this.deleted_addresses = [];
            })
            .catch((err) => {
             this.loading = false;
             console.log(err);
             this.emitRefreshPulse();
             this.edit_toggle = false;
            })

      },
      addAddress(){
        var value = this.$refs.email_input.value;

        if (value != ""){
          this.new_addresses.push(value);
        }

        this.$refs.email_input.value = "";
      },
      addNumber(){
        var value = this.$refs.number_input.value;

        if (value != ""){
          this.new_numbers.push(value);
        }

        this.$refs.number_input.value = "";
      },
      removeEmailFromExisting(index){
        // Add it to the deleted list
        this.deleted_addresses.push(this.contactdata.email_addresses[index]);

        // Remove from the existing
        Vue.delete(this.contactdata.email_addresses, index);
      },
      removeNumberFromExisting(index){
        // Add it to the deleted list
        this.deleted_numbers.push(this.contactdata.phone_numbers[index]);

        // Remove from the existing
        Vue.delete(this.contactdata.phone_numbers, index);
      },
      removeEmailFromNew(index){
        // Remove from the new
        Vue.delete(this.new_addresses, index);
      },
      removeNumberFromNew(index){
        // Remove from the existing
        Vue.delete(this.new_numbers, index);
      },
      emitRefreshPulse(){
        this.$emit('pulse');
      },
      deleteContact() {
      var contact_id = this.contactdata.contact_id;
      var url = "/api/contact/" + contact_id;
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
    },
    computed: {
      editted: function() {
        if ((this.new_addresses.length) || (this.new_numbers.length) || (this.deleted_addresses.length)){
          return true
        }
        else {
          return false
        }
      }
    }
};
