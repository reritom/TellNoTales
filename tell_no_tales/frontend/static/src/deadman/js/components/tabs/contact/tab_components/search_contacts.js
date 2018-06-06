export default {
  name: "SearchContacts",
  props: ['noneyet'],
  data: function() {
    return {
      message: ""
    }
  },
  template: `<div>
              <input class="search-bar" @input="broadcastSearch($event.target.value)" placeholder="Search contacts">
            </div>`,
  methods: { broadcastSearch(value) {
    this.message = value;
    this.$emit('search', value);
    //console.log(value);
  }}
};
