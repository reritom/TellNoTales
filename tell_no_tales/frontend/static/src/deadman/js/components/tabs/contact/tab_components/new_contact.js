export default {
  name: "NewContact",
  props: ['noneyet'],
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
        formData = new FormData;

        formData.append('name', this.name);
        formData.append('numbers', JSON.stringify(this.numbers));
        formData.append('addresses', JSON.stringify(this.addresses));

        this.sendContact(formData);

      }
    },
    sendContact(formData) {
      this.$http.post('/api/contact' + formData)
          .then((response) => {
            console.log(response.data);
            this.loading = false;

            //TODO IF status ok, then show success message, else show error
            this.emitRefreshPulse();
            this.edit_toggle = false;

            this.numbers = [];
            this.addresses = [];
            this.name = ""
          })
          .catch((err) => {
           this.loading = false;
           console.log(err);
           this.emitRefreshPulse();
          })
    }
  },
  template: `<div>
                <div @click="expanded_toggle = !expanded_toggle">
                  <p>New contact component here</p>
                </div>
                <div v-if="expanded_toggle">
                  <p>This is the expanded part</p>

                  <input v-model="name" placeholder="Add their name">

                  <div v-for="number, index in numbers">
                    <p @click="removeNumber(index)">{{number}}</p>
                  </div>
                  <div>
                    <input ref="number_input" placeholder="Add an number">
                    <button @click="addNumber()">Number tick</button>
                  </div>

                  <div v-for="address, index in addresses">
                    <p @click="removeEmail(index)">{{address}}</p>
                  </div>
                  <div>
                    <input ref="email_input" placeholder="Add an email">
                    <button @click="addEmail()">Email tick</button>
                  </div>

                  <button :disabled="!valid_form" @click="createContact()">save</button>
                </div>
             </div>`
};
