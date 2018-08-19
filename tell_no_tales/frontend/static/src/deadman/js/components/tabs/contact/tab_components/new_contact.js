export default {
  name: "NewContact",
  data: function() {
    return {
      name: "",
      addresses: [],
      numbers: []
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
    emitFinished(){
      this.$emit('finished');
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

              this.numbers = [];
              this.addresses = [];
              this.name = ""
              this.emitFinished();
            }
          })
          .catch((err) => {
           this.loading = false;
           console.log(err);
           this.emitRefreshPulse();
          })
    }
  },
  template: `<div class="container">
              <div class="card card-drop">
                <div class="card-header">
                  <input class="form-control" placeholder="Their name" v-model="name">
                </div>
                <div class="card-body">
                  <div style="display:flex; justify-content:space-between">
                    <p class="text-muted">Their numbers</p>
                    <i class="material-icons text-muted">contact_phone</i>
                  </div>

                  <div v-for="number, index in numbers">
                    <div style="display:flex; justify-content:space-between">
                      <p class="text-muted">{{number}}</p>
                      <i class="material-icons text-muted" @click="removeNumber(index)" style="color:red">remove</i>
                    </div>
                  </div>
                  <div>
                    <div class="input-group">
                      <div class="input-group-prepend">
                        <i class="input-group-text material-icons" id="basic-addon1">phone</i>
                      </div>
                      <input ref="number_input" type="text" class="form-control" placeholder="Add" aria-label="Phone" aria-describedby="basic-addon2">
                      <div class="input-group-append">
                        <i class="input-group-text material-icons" id="basic-addon2" @click="addNumber()">check</i>
                      </div>
                    </div>
                  </div>

                  <br>

                  <div style="display:flex; justify-content:space-between">
                    <p class="text-muted">Their emails</p>
                    <i class="material-icons text-muted">contact_mail</i>
                  </div>


                  <div v-for="address, index in addresses">
                    <div style="display:flex; justify-content:space-between">
                      <p class="text-muted">{{address}}</p>
                      <i class="material-icons text-muted" @click="removeEmail(index)">remove</i>
                    </div>
                  </div>
                  <div>
                    <div class="input-group">
                      <div class="input-group-prepend">
                        <i class="input-group-text material-icons" id="basic-addon1">alternate_email</i>
                      </div>
                      <input ref="email_input" type="text" class="form-control" placeholder="Add" aria-label="Email" aria-describedby="basic-addon3">
                      <div class="input-group-append">
                        <i class="input-group-text material-icons" id="basic-addon3" @click="addEmail()">check</i>
                      </div>
                    </div>
                  </div>

                  <br>

                  <form class="form-inline" style="justify-content:space-between">
                    <button type="button" :disabled="!valid_form" class="btn btn-outline-success" @click="createContact()">Create</button>
                    <button type="button" class="btn btn-link" @click="emitFinished()">Cancel</button>
                  </form>
                </div>
              </div>
             </div>`
};
