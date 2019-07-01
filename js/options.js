var app = new Vue({
  el: '#app',
  data: {
    collection: [],
    req: '',
    res: ''
  },

  created () {
    this.bg = chrome.extension.getBackgroundPage()
    this.collection =  JSON.parse(this.bg.localStorage.MODIFY_R)
  },
  
  methods: {
    add () {
      let obj = {
        req: this.req,
        res: this.res,
        checked: true
      }
      this.collection.push(obj)
      this.save()
    },

    show () {
      console.log(this.collection)
      console.log(window.localStorage.MODIFY_R)
    },

    save () {
      this.bg.localStorage.MODIFY_R = JSON.stringify(this.collection)
      
      console.log(this.bg.localStorage.MODIFY_R)
    },

    change () {
      this.save()
    }
  }
})