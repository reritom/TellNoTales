export default {
  name: "NewContact",
  data: function() {
    return {
      name: "",
      addresses: [],
      numbers: [],
      expanded_toggle: false
    }
  },
  computed: {
    valid_form: function() {
      return ((this.name != "") && (this.addresses.length > 0 || this.numbers.length > 0 ))
    }
  },
  methods: {
    addEmail() {
      var email = this.$refs.email_input.value;
      if (email != ""){
        this.addresses.push(email);
        this.$refs.email_input.value = "";
      }
    },
    addNumber() {
      var number = this.$refs.number_input.value;
      if (number != ""){
        this.numbers.push(number);
        this.$refs.number_input.value = "";
      }
    },
    removeEmail(index) {
      Vue.delete(this.addresses, index)
    },
    removeNumber(index) {
      Vue.delete(this.numbers, index)
    },
    emitRefreshPulse() {
      this.$emit('pulse');
    },
    createContact() {
      if (this.valid_form) {
        var formData = new FormData();

        formData.append('name', this.name);
        formData.append('numbers', JSON.stringify(this.numbers));
        formData.append('addresses', JSON.stringify(this.addresses));

        this.sendContact(formData);

      }
    },
    sendContact(formData) {
      console.log("Posting new contact with data");

      // Display the key/value pairs
        for (var pair of formData.entries()) {
            console.log(pair[0]+ ', ' + pair[1]);
        }

      this.$http.post('/api/contact', formData)
          .then((response) => {
            console.log(response.data);
            this.loading = false;

            //TODO IF status ok, then show success message, else show error
            if (response.data.status === true) {
              this.emitRefreshPulse();
              this.edit_toggle = false;

              this.numbers = [];
              this.addresses = [];
              this.name = ""
            }
          })
          .catch((err) => {
           this.loading = false;
           console.log(err);
           this.emitRefreshPulse();
          })
    }
  },
  template: `<div class="inner-tile container">
                <button class="btn btn-outline-success my-2 my-sm-0" v-on:click="expanded_toggle = !expanded_toggle">New contact</button>

                <div v-if="expanded_toggle">
                  <input type="text" v-model="name" class="form-control" placeholder="Add their name">

                  <div v-for="number, index in numbers">
                    <div class="input-group">
                      <div class="input-group-prepend">
                        <span class="input-group-text" id="basic-addon4">phone</span>
                      </div>
                      <input type="text" readonly class="form-control" :placeholder="number" aria-label="Number" aria-describedby="basic-addon4">
                      <div class="input-group-append">
                        <span class="input-group-text" id="basic-addon4" @click="removeNumber(index)">x</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div class="input-group">
                      <div class="input-group-prepend">
                        <span class="input-group-text" id="basic-addon1">phone</span>
                      </div>
                      <input ref="number_input" type="text" class="form-control" placeholder="Add Phone Number" aria-label="Phone" aria-describedby="basic-addon2">
                      <div class="input-group-append">
                        <span class="input-group-text" id="basic-addon2" @click="addNumber()">t</span>
                      </div>
                    </div>
                  </div>

                  <div v-for="address, index in addresses">
                    <div class="input-group">
                      <div class="input-group-prepend">
                        <span class="input-group-text" id="basic-addon1">@</span>
                      </div>
                      <input type="text" readonly class="form-control" :placeholder="address" aria-label="Email" aria-describedby="basic-addon1">
                      <div class="input-group-append">
                        <span class="input-group-text" id="basic-addon1" @click="removeEmail(index)">x</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div class="input-group">
                      <div class="input-group-prepend">
                        <span class="input-group-text" id="basic-addon1">@</span>
                      </div>
                      <input ref="email_input" type="text" class="form-control" placeholder="Add Email Address" aria-label="Email" aria-describedby="basic-addon3">
                      <div class="input-group-append">
                        <span class="input-group-text" id="basic-addon3" @click="addEmail()">t</span>
                      </div>
                    </div>
                  </div>

                  <button :disabled="!valid_form" class="btn btn-primary btn-block mb-2" @click="createContact()">save</button>
                </div>
             </div>`
};
