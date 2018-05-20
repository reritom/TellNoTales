export default {
  name: "SearchMessages",
  // A search bar which emits the value of the search
  props: ['noneyet'],
  data: function () {
    return {
      message: ""
    }
  },
  template: `<div>
              <input @input="broadcastSearch($event.target.value)" placeholder="Search messages">
            </div>`,
  methods: { broadcastSearch(value) {
    this.message = value;
    this.$emit('search', value);
    //console.log(value);
  }}
};
