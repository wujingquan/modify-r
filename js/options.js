var app = new Vue({
  el: '#app',
  data: {
    collection: [],
    req: '',
    res: ''
  },

  created () {
    this.bg = chrome.extension.getBackgroundPage()
    try {
      this.collection =  JSON.parse(this.bg.localStorage.MODIFY_R)
    } catch (err) {
      this.collection = []
      console.error(err)
    }
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
    },

    // 导入数据
    import_db (obj) {
      if (!confirm('导入的数据会清空现有的数据，你确定继续操作吗？')) return
      
      let that = this
      let file = obj.target.files[0]
      if (file) {
        let reader = new FileReader()
        reader.readAsText(file)
        reader.onload = function (e) {
          try {
            that.collection = JSON.parse(this.result)
            that.save()
          } catch (err) {
            console.error(err)
            alert("导入失败，请检查文件格式及内容是否正确")
          }
        }
      }
    },

    // 导出数据
    export_db () {

    },

    // 清空规则
    clear () {
      if (!confirm('你确定清空规则吗？')) return
      
      this.collection = []
      this.save()
    }
  }
})