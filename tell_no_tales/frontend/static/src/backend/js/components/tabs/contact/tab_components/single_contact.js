export default {
  name: "SingleContact",
  props: ['contactdata'],
  data: function() {
    return {
      expanded_toggle: false,
      delete_toggle: false,
      edit_toggle: false,
      finalise_delete_toggle: false,
      existing_addresses: [],
      new_addresses: [],
      new_numbers: [],
      existing_numbers: [],
      deleted_addresses: [],
      deleted_numbers: [],
      loading: false
    }
  },
  template: `<li>
              <h3 @click="expanded_toggle = !expanded_toggle">{{contactdata.name}}</h3>

              <div v-if="expanded_toggle">

                <div v-if="existing_addresses.length">
                  <div v-for="address, index in existing_addresses">
                    <div v-if="edit_toggle">

                      <div class="input-group">
                        <div class="input-group-prepend">
                          <span class="input-group-text" id="basic-addon1">@</span>
                        </div>
                        <input type="text" readonly class="form-control" :placeholder="address" aria-label="Email" aria-describedby="basic-addon1">
                        <div class="input-group-append">
                          <span class="input-group-text" id="basic-addon1" @click="removeEmailFromExisting(index)">x</span>
                        </div>
                      </div>

                    </div>
                    <div v-else>
                      <p>Address is {{address}}</p>
                    </div>
                  </div>
                </div>
                <div v-else>
                  <p>This contact has no existing addresses</p>
                </div>

                <div v-for="address, index in new_addresses">
                  <div v-if="edit_toggle">
                    <div class="input-group">
                      <div class="input-group-prepend">
                        <span class="input-group-text" id="basic-addon1">@</span>
                      </div>
                      <input type="text" readonly class="form-control" :placeholder="address" aria-label="Email" aria-describedby="basic-addon1">
                      <div class="input-group-append">
                        <span class="input-group-text" id="basic-addon1" @click="removeEmailFromNew(index)">x</span>
                      </div>
                    </div>
                  </div>
                  <div v-else>
                    <p>New Address is {{address}}</p>
                  </div>
                </div>


                <!-- Create a new email address-->
                <div v-if="edit_toggle">
                  <div class="input-group">
                    <div class="input-group-prepend">
                      <span class="input-group-text" id="basic-addon1">@</span>
                    </div>
                    <input ref="email_input" type="text" class="form-control" placeholder="Add Email Address" aria-label="Email" aria-describedby="basic-addon3">
                    <div class="input-group-append">
                      <span class="input-group-text" id="basic-addon3" @click="addAddress">t</span>
                    </div>
                  </div>
                </div>


                <p>These are the phone numbers</p>

                <div v-if="existing_numbers.length">
                  <div v-for="number, index in existing_numbers">

                    <!-- Remove an existing number -->
                    <div v-if="edit_toggle">

                      <div class="input-group">
                        <div class="input-group-prepend">
                          <span class="input-group-text" id="basic-addon4">phone</span>
                        </div>
                        <input type="text" readonly class="form-control" :placeholder="number" aria-label="Number" aria-describedby="basic-addon4">
                        <div class="input-group-append">
                          <span class="input-group-text" id="basic-addon4" @click="removeNumberFromExisting(index)">x</span>
                        </div>
                      </div>

                    </div>
                    <div v-else>
                      <p>Existing number {{number}}</p>
                    </div>
                  </div>
                </div>

                <div v-else>
                  <p>This contact has no current numbers</p>
                </div>

                <!-- Remove one of the new numbers -->
                <div v-for="number, index in new_numbers">
                  <div v-if="edit_toggle">

                    <div class="input-group">
                      <div class="input-group-prepend">
                        <span class="input-group-text" id="basic-addon4">phone</span>
                      </div>
                      <input type="text" readonly class="form-control" :placeholder="number" aria-label="Number" aria-describedby="basic-addon4">
                      <div class="input-group-append">
                        <span class="input-group-text" id="basic-addon4" @click="removeNumberFromNew(index)">x</span>
                      </div>
                    </div>

                  </div>
                  <div v-else>
                    <p>New number {{number}}</p>
                  </div>
                </div>

                <!-- Add a new number -->
                <div v-if="edit_toggle">
                  <div class="input-group">
                    <div class="input-group-prepend">
                      <span class="input-group-text" id="basic-addon1">phone</span>
                    </div>
                    <input ref="number_input" type="text" class="form-control" placeholder="Add Phone Number" aria-label="Phone" aria-describedby="basic-addon2">
                    <div class="input-group-append">
                      <span class="input-group-text" id="basic-addon2" @click="addNumber">t</span>
                    </div>
                  </div>
                </div>

                <div v-if='!edit_toggle'>
                  <button @click="edit_toggle = !edit_toggle">Edit me</button>
                </div>
                <div v-else> <!-- Options to save changes or cancel -->
                  <form class="form-inline" style="justify-content:space-between">
                    <button type="button" @click="saveChanges()" :disabled="!editted" class="btn btn-outline-success">Save changes</button>
                    <button type="button" @click="edit_toggle=false; resetChanges()" class="btn btn-link">Cancel</button>
                  </form>
                </div>


                <form class="form-inline" style="justify-content:space-between">
                  <button type="button" class="btn btn-outline-danger" v-if="!finalise_delete_toggle" :disabled="!contactdata.deletable" @click="finalise_delete_toggle = true">Delete me</button>
                  <button type="button" class="btn btn-outline-danger" readonly v-else>Are you sure?</button>
                  <p v-if="!contactdata.deletable" class="text-muted">This message can't be deleted as it is used by an unlocked message</p>
                  <div v-if="finalise_delete_toggle">
                    <button type="button" class="btn btn-danger" @click="deleteContact()">Yes</button>
                    <button type="button" class="btn btn-light" @click="finalise_delete_toggle = false">No</button>
                  </div>
                </form>

              </div>
            </li>`,
    methods: {
      resetChanges() {
        console.log("Resetting");
        this.new_addresses = [];
        this.new_numbers = [];
        this.deleted_numbers = [];
        this.deleted_addresses = [];
        this.existing_numbers = JSON.parse(JSON.stringify(this.contactdata.phone_numbers));
        this.existing_addresses = JSON.parse(JSON.stringify(this.contactdata.email_addresses));
      },
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
        this.deleted_addresses.push(this.existing_addresses[index]);

        // Remove from the existing
        Vue.delete(this.existing_addresses, index);
      },
      removeNumberFromExisting(index){
        // Add it to the deleted list
        this.deleted_numbers.push(this.existing_numbers[index]);

        // Remove from the existing
        Vue.delete(this.existing_numbers, index);
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
        if ((this.new_addresses.length) || (this.new_numbers.length) || (this.deleted_addresses.length) || (this.deleted_numbers.length)){
          return true
        }
        else {
          return false
        }
      }
    },
    created: function () {
      this.existing_numbers = JSON.parse(JSON.stringify(this.contactdata.phone_numbers));
      this.existing_addresses = JSON.parse(JSON.stringify(this.contactdata.email_addresses));
    },
    watch:{
      contactdata: function() {
        this.resetChanges();
      }
    }
};
