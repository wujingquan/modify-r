import { MODIFY_R, EXAMPLE_TARGET } from './constant.js'
import { DEBUG }  from '../env.js'

const app = new Vue({
  el: '#app',
  data() {
    return {
      collection: []
    }
  },
  
  created () {
    this._bg = chrome.extension.getBackgroundPage()
    const collection = this._bg.localStorage[MODIFY_R]
    this.collection = collection ? JSON.parse(collection) : []
  },

  watch: {
    collection: {
      deep: true,
      handler(newCollection) {
        this._bg.localStorage[MODIFY_R] = JSON.stringify(newCollection)
        this._bg.getLocalStorage()
      }
    }
  },
  
  methods: {
    addGroup() {
      const id = uuidv4()
      this.collection.push({
        id,
        name: 'Default',
        groupEditable: false,
        childrenLength: 1
      })
      this.addAction({ id })
    },
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
        childrenLength: 1,
        targetId: uuid,
        id: uuid,
        target: EXAMPLE_TARGET,
        enabled: true,
        disabled: false,
        editable: false
      }

      this.$set(this.collectionObj, uuid, obj)
      this.addAction(obj)
      this.save()
    },

    addAction({ id }) {
      const collection = this.collection
      // 如果当前组有空白的 Request 或者 Response 则不能再添加
      const emptyList = collection.filter(item => (!item.request && item.groupId) || (!item.response && item.groupId))
      console.log('emptyList', emptyList)
      if (emptyList.length) return this.$message.error('请把空白的填写完成')

      collection.push({
        groupId: id,
        id:  uuidv4(),
        name: '',
        request: '',
        response: '',
        requestEditable: false,
        responseEditable: false,
        actionType: 'XHR',
        enabled: true
      })

      collection.find(item => item.id === id).childrenLength++
      this.collection = Object.values(_.groupBy(collection, (item) => item.groupId || item.id)).flat()
    },

    cpAction(row) {
      this.collection.push({ ...row, id: uuidv4() })
      this.collection.find(item => item.id === row.groupId).childrenLength++
      this.$message.success('复制成功')
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
      this.collection[id]['editable'] = true
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
      if (row.groupId && column.label === 'Request') {
        this.editRequest(row)
        return
      }
      if (row.groupId && column.label === 'Response') {
        this.editResponse(row)
        return
      }

      if (!row.groupId && column.label === 'Group') {
        this.editGroup(row)
        return
      }
    },

    editRequest(action) {
      action.requestEditable = true
      this.$nextTick(() => {
        this.$refs[`requestRef-${action.id}`].focus()
      })
    },

    editResponse(action) {
      action.responseEditable = true
      this.$nextTick(() => {
        this.$refs[`responseRef-${action.id}`].focus()
      })
    },

    editGroup(group) {
      group.groupEditable = true
      this.$nextTick(() => {
        this.$refs[`groupRef-${group.id}`].focus()
      })
    },

    blur(row) {
      if (row.groupId) {
        row.requestEditable = false
        row.responseEditable = false
        return
      }
      
      if (!row.groupId) {
        row.groupEditable = false
        return
      }
    },

    inputEnter(row) {
      /**
       * input 的 enter 事件触发该处的逻辑， 使 editable = false
       * 当 editable = false 时，el-input 组件隐藏（生命周期结束），失去焦点
       * 因此会触发 el-input 的 blur 事件，导致执行了 this.blur 事件
       * 
       */
       if (row.groupId) {
        row.requestEditable = false
        row.responseEditable = false
        return
      }
      
      if (!row.groupId) {
        row.groupEditable = false
        return
      }
    },
    
    delGroup({ id }) {
      this.collection = this.collection.filter(item => {
        if (item.id === id) return false
        if (item.groupId && item.groupId === id) return false
        return true
      })
    },

    delAction({ id, groupId }) {
      const collection = this.collection
      const index = collection.findIndex(item => item.id === id)
      this.$delete(this.collection, index)
      const group = collection.find(item => item.id === groupId)
      group.childrenLength--
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

    rowStyleFn({ row, rowIndex }) {
      if (row.groupId) {
        const group = this.collection.find(item => item.id === row.groupId)
        if (group.childrenLength === 2) {
          return {
            height: '86px'
          }
        }
      }
    },
    
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (!row.groupId) {
        if (columnIndex < 1) {
          return {
            rowspan: row.childrenLength,
            colspan: 1
          }
        }
        if (columnIndex > 0) {
          return {
            rowspan: 0,
            colspan: 0
          }
        }
      }

      if (row.groupId) {
        if (columnIndex < 1) {
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