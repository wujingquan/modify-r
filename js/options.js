import { MODIFY_R, EXAMPLE_TARGET } from './constant.js'
import { DEBUG }  from '../env.js'

const app = new Vue({
  el: '#app',
  data() {
    return {
      collectionObj: {}
    }
  },

  computed: {
    collection() {
      const ret = _.groupBy(Object.values(this.collectionObj), 'targetId')
      return [].concat(...Object.values(ret))
    }
  },
  
  created () {
    this._bg = chrome.extension.getBackgroundPage()
    let database = this._bg.localStorage[MODIFY_R]
    if (database) {
      database = JSON.parse(database)
      if (Array.isArray(database) && database.length) {
        this.collectionObj = {}
      } else {
        this.collectionObj = database
      }
    } else {
      this.collectionObj = {}
    }
  },
  
  methods: {
    addTarget () {
      const isExist = this.collection.find((item) => {
        return item.target === EXAMPLE_TARGET
      })
      console.log(isExist)

      if (isExist) {
        return
      }
      
      const uuid = uuidv4()
      const obj = {
        type: 'p',
        childrenLength: 1,
        targetId: uuid,
        id: uuid,
        target: EXAMPLE_TARGET,
        enable: true,
        disabled: false,
        editable: false
      }

      this.$set(this.collectionObj, uuid, obj)
      this.addAction(obj)
      this.save()
    },

    addAction({ targetId, target }) {
      const uuid = uuidv4()
      const obj = {
        type: 'c',
        targetId: targetId,
        id: uuid,
        target,
        enable: true,
        disabled: false,
        editable: false,
        uriType: ''
      }

      this.collectionObj[targetId].childrenLength++
      
      this.$set(this.collectionObj, uuid, obj)

      this.save()
    },

    show () {
      console.log(this.collection)
      console.log(window.localStorage.MODIFY_R)
    },

    save () {
      this._bg.localStorage[MODIFY_R] = JSON.stringify(this.collectionObj)
      
      console.log(this._bg.localStorage[MODIFY_R], this.collectionObj)
    },

    editTarget({ id }) {
      this.collectionObj[id]['editable'] = true
      this.$nextTick(() => {
        this.$refs[`target-${id}`].focus()
      })
    },

    editAction({ id }) {
      this.collectionObj[id]['editable'] = true
      this.$nextTick(() => {
        this.$refs[`uri-${id}`].focus()
      })
    },

    editFn(...args) {
      const [	row, column, cell, event] = args
      console.log(row, column, cell, event)
      if (!['target', 'uri'].includes(column.property)) {
        return
      }
      if (row.type === 'p') {
        this.editTarget(row)
      }

      if (row.type === 'c') {
        this.editAction(row)
      }
    },

    blur({ id, type, target }) {
      this.collectionObj[id]['editable'] = false
      if (type === 'p') {
        Object.values(this.collectionObj).forEach((item) => {
          if (item.type === 'c' && item.targetId === id) {
            item.target = target 
          }
        })
      }
      this.save()
    },

    inputEnter({ id }) {
      /**
       * input 的 enter 事件触发该处的逻辑， 使 editable = false
       * 当 editable = false 时，el-input 组件隐藏（生命周期结束），失去焦点
       * 因此会触发 el-input 的 blue 事件，导致执行了 this.blur 事件
       * 
       */
      this.collectionObj[id].editable = false
      
    },
    
    delTarget({ targetId }) {
      Object.values(this.collectionObj)
        .filter((action) => {
          return action.targetId === targetId
        })
        .map((action) => {
          return action.id
        })
        .forEach((id) => {
          this.$delete(this.collectionObj, id)
        })
      
      this.save()
    },

    delAction({ id, targetId }) {
      this.$delete(this.collectionObj, id)
      this.collectionObj[targetId].childrenLength--
      this.save()
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
      if (row.type === 'p') {
        if (columnIndex < 2) {
          return {
            rowspan: row.childrenLength,
            colspan: 1
          }
        }
        if (columnIndex > 1) {
          return {
            rowspan: 0,
            colspan: 0
          }
        }
      }

      if (row.type === 'c') {
        if (columnIndex < 2) {
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