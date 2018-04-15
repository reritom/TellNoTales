Vue.component('blog-post', {
  props: ['type'],
  template: '<h3>Helloworld {{type}}</h3>'
})


new Vue({
  el: '#VueContainer',
  delimiters: ['[[',']]'],
  data: {
  messages: [],
  contacts: [],
  loading: false,
  view: false},
methods: {
  logIn: function() {
 this.loading = true;

   var formData = new FormData();
  formData.append('username', 'tom');
  formData.append('password', 'testpassword');

 this.$http.post('/api/login/', formData)
     .then((response) => {
       console.log(response.data);
       this.loading = false;
     })
     .catch((err) => {
      this.loading = false;
      console.log(err);
     })
},
getMessages: function() {
  this.loading = true;
  this.$http.get('/api/message/')
      .then((response) => {
        console.log(response);
          console.log(response.data);
            console.log(response.data.data);
      this.messages = response.data.data.messages;
      this.loading = false;
      })
      .catch((err) => {
       this.loading = false;
       console.log(err);
      })
}
}
})
