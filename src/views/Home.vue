<template>
  <div class="home">
    <div class="map-container" @mousemove="mapMouseMove" @mouseout="mapMouseOut">
      <div class="map" ref="map"></div>
      <LineManagerView v-if="map" :map="map" :data="lineList" ref="lineManager" :status="status" :x="x" :y="y" :clearWidth="clearNumber" />
    </div>

    <div class="control">
      <div class="button-control">
        <label>{{statusName}}</label>
        <el-button style="margin-left:5px;" type="primary" @click="showAdd">新增</el-button>
        <el-button style="margin-left:5px;" type="warning" @click="clearModel">{{statusName == '擦除' ? '取消擦除' : '擦除'}}</el-button>
        <el-button style="margin-left:5px;" type="success" @click="merge">合并</el-button>
        <el-button style="margin-left:5px;" @click="exportAll">{{exportVisible ? '关闭导出' : '批量导出'}}</el-button>
      </div>
      <div class="line-control">
        <template v-if="statusName == '查看'">
          <LineView v-for="(line,index) in lineList" :key="line.id" :data="line" @remove="removeLine(index)" @reverse="reverseLine(line,index)" @mouseout="lineMouseOut(line,index)" @mouseover="lineMouseOver(line,index)" @copyLine="copyLine(line)" @input="e=>line.name = e" @lock="changeLock(line,index)" />
        </template>
        <template v-else-if="statusName == '擦除'">
          <div class="clear-container">
            <div v-for="width in clearNumberList" :key="width" class="clear-block" :style="getClearStyle(width)" :class="{active:width == clearNumber}" @click="clearNumber = width"></div>
          </div>

        </template>

      </div>
    </div>
    <AddDialog ref="addDialog" @add="addLine" />
    <TransferDialog ref="transferDialog" :dataList="generateData" :base64="imgBase64" @close="imgBase64 = null" @merge="mergeLine" @createImage="createImageLine" />
    <RemarkDialog ref="remarkDialog" :value="remark" @close="remark = null" />
    <ExportDialog :visible="exportVisible" :lineList="lineList" @exportLine="exportLine" />
  </div>
</template>

<script>
let __id = 0
// import HANG_ZHOU from '../assets/HANGZHOU'
// import SHAO_XING from '../assets/SHAOXING'
import AddDialog from '@/components/AddDialog'
import RemarkDialog from '@/components/RemarkDialog'
import TransferDialog from '@/components/TransferDialog'
import LineView from '@/components/LineView'
import LineManagerView from '@/components/LineManager'
import ExportDialog from '@/components/ExportDialog.vue'
import LineManager from '@/assets/LineManager'
import { transposePolyrect, LineToString } from '../assets/utils'
const ACTIVE_COLOR = 'red'
export default {
  name: 'home',
  components: {
    AddDialog,
    LineView,
    LineManagerView,
    TransferDialog,
    RemarkDialog,
    ExportDialog
  },
  data () {
    return {
      lineList: [],
      map: null,
      status: LineManager.VIEW,
      x: -1000,
      y: -1000,
      clearNumberList: [10, 15, 20, 30, 40, 50],
      clearNumber: 20,
      mergeList: [],
      remark: null,
      imgBase64: null,
      exportVisible: false
    }
  },
  computed: {
    statusName () {
      if (this.status == LineManager.VIEW) {
        return '查看'
      } else if (this.status == LineManager.CLEAR) {
        return '擦除'
      } else if (this.status == LineManager.EDIT) {
        return '编辑'
      }
      return 'err'
    },
    generateData () {
      let list = this.lineList.map(t => {
        return {
          key: t.id,
          label: t.name
        }
      })
      return list
    }
  },
  mounted () {
    this.map = new AMap.Map(this.$refs.map, {
      zoom: 8,
      center: [120, 30]
    })

    this.map.on('click', e => {
      console.log(e.lnglat)
    })

    // // // 测试代码
    // setTimeout(() => {
    //   this.addLine({
    //     name: '杭州',
    //     text: HANG_ZHOU
    //   })

    //   this.addLine({
    //     name: '绍兴',
    //     text: SHAO_XING
    //   })
    // }, 500);

  },
  methods: {
    copyLine (lineObj) {
      let line = lineObj.line
      let st = LineToString(line)
      // console.log(st)
      this.remark = st
      this.$refs.remarkDialog.show()
    },
    exportAll () {
      this.exportVisible = !this.exportVisible
    },
    // 合并
    merge () {
      if (this.status == LineManager.VIEW) {
        this.$refs.transferDialog.show()
      }
    },
    showAdd () {
      if (this.status == LineManager.VIEW) {
        this.$refs.addDialog.show();
      }
    },
    clearModel () {
      let clear = this.status == LineManager.CLEAR
      if (clear) {  // 当前状态是清除模式
        let list = this.$refs.lineManager.getLineList()
        this.lineList = list
      }
      this.status = clear ? LineManager.VIEW : LineManager.CLEAR
    },
    createImageLine (obj) {
      this.imgBase64 = null
      let data = obj.data
      if (data.length == 0) return
      let list = data.map(item => {
        let obj = this.lineList.find(t => t.id == item.key)
        return obj
      })
      // 合并后的线段
      let mlist = list.reduce((pre, sur) => {
        return [...pre, ...sur.line]
      }, [])
      this.$refs.lineManager.createLine(mlist).then(base64 => {
        this.imgBase64 = base64
      })
    },
    mergeLine (obj) {
      let data = obj.data
      if (data.length == 0) return
      let list = data.map(item => {
        let obj = this.lineList.find(t => t.id == item.key)
        return obj
      })
      // console.log(list)

      let name = list.reduce((pre, sur) => {
        let name = pre + sur.name + ' '
        return name
      }, '合: ');

      let mlist = list.reduce((pre, sur) => {
        return [...pre, ...sur.line]
      }, [])

      let mergeObj = {
        id: list[0].id,
        color: list[0].color,
        name: name,
        line: mlist
      }
      this.lineList = [mergeObj, ...this.lineList.filter(lineObj => {
        let m = data.find(d => d.key == lineObj.id)
        return !m
      })]

    },
    addLine (obj) {
      // console.log(str)

      let arr = transposePolyrect(obj.text)
      let num = arr.length == 1 ? '' : 1;
      // console.log(arr)
      let list = arr.map(t => {
        let o = {
          line: t,
          id: ++__id,
          name: obj.name + num,
          color: 'blue',
          lock: false
        }
        if (num) num++;
        return o;
      })
      this.lineList.push(...list)
    },
    removeLine (index) {
      this.lineList.splice(index, 1)
      // let index = this.lineList.findIndex(t=> t == )
    },
    reverseLine (data, index) {
      this.lineList.splice(index, 1, {
        ...data,
        line: data.line.reverse()
      })
    },
    changeLock (data, index) {
      this.lineList.splice(index, 1, {
        ...data,
        lock: !data.lock
      })
    },
    exportLine (list) {
      let data = this.lineList.map(lineObj => {
        let cid = list.find(id => id == lineObj.id)
        if (cid) {
          return {
            ...lineObj,
            color: ACTIVE_COLOR,
            lastPointColor: 'gold',
            lastPointSize: 20
          }

        } else {
          return {
            ...lineObj,
            color: 'blue',
            lastPointColor: undefined,
            lastPointSize: undefined
          }
        }
      })
      this.lineList = data
    },
    lineMouseOut (data, index) {
      this.lineList.splice(index, 1, {
        ...data,
        color: 'blue',
        lastPointColor: undefined,
        lastPointSize: undefined
      })
    },
    lineMouseOver (data, index) {
      this.lineList.splice(index, 1, {
        ...data,
        color: ACTIVE_COLOR,
        lastPointColor: 'gold',
        lastPointSize: 20
      })
      //data.color = 'yellow'
    },
    draw () {
      this.$refs.lineManager.draw()
    },
    mapMouseMove (e) {
      this.x = e.clientX
      this.y = e.clientY
      // console.log(this.x, this.y, 'move')
    },
    mapMouseOut () {
      this.x = -1000
      this.y = -1000
    },
    getClearStyle (width) {
      return {
        width: width + 'px',
        height: width + 'px'
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.home {
  width: 100vw;
  height: 100vh;
  display: flex;
  .map-container {
    height: 100%;
    width: 100%;
    position: relative;
    .map {
      width: 100%;
      height: 100%;
    }
  }

  .control {
    flex-shrink: 0;
    width: 400px;
    height: 100%;
    display: flex;
    flex-flow: column nowrap;
    .button-control {
      width: 100%;
      height: 50px;
      display: flex;
      align-items: center;
    }
    .line-control {
      width: 100%;
      height: 100%;
      background-color: aqua;
      overflow-y: auto;
      // display: flex;
      // flex-flow: row wrap;
      // justify-content: flex-start;
      // align-items: flex-start;
      .clear-container {
        display: flex;
        align-items: center;
        margin-top: 15px;
        .clear-block {
          float: left;
          margin-left: 10px;
          background-color: #fff;
          &.active {
            border: 1px solid red;
          }
        }
      }
    }
  }
}
</style>
