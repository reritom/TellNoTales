export default {
  name: "SearchMessages",
  // A search bar which emits the value of the search
  props: ['noneyet'],
  data: function () {
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
