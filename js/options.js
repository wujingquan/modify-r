import { DEBUG }  from '../env.js'
import { collection } from '../test/mock.js'

const newCollection = []
const indexs = [0]
for(const item of collection.injectCollection) {
  indexs.push(item.actions.length + indexs[indexs.length - 1])
  for (const action of item.actions) {
    action.target = item.target
    newCollection.push(action)
  }
}

console.log(newCollection)


const app = new Vue({
  el: '#app',
  data() {
    return {
      collection: [],
      req: '',
      res: '',
      tableData: newCollection
    }
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
    },

    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        if (indexs.includes(rowIndex)) {
          return {
            rowspan: 4,
            colspan: 1
          }
        } else {
          return {
            rowspan: 0,
            colspan: 0
          }
        }
      }
    }
  }
})

DEBUG && (window.app = app)