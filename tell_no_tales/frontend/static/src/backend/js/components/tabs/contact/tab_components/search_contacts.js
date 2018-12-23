export default {
  name: "SearchContacts",
  props: ['noneyet'],
  data: function() {
    return {
      message: ""
    }
  },
  template: `<div class="container">
              <input class="form-control mr-sm-2" @input="broadcastSearch($event.target.value)" placeholder="Search">
            </div>`,
  methods: { broadcastSearch(value) {
    this.message = value;
    this.$emit('search', value);
    //console.log(value);
  }}
};
