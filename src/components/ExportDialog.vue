<template>
  <div class="export-container" v-show="visible">
    <el-checkbox-group v-model="checkList" @change="handleCheckedCitiesChange">
      <el-checkbox v-for="item in lineList" :label="item.id" :key="item.id">{{item.name}}</el-checkbox>
    </el-checkbox-group>

    <el-input style="margin-top:10px;" type="textarea" v-model="text" :rows="15" placeholder=""></el-input>
  </div>
</template>
<script>
import { LineToString } from '@/assets/utils'
export default {
  props: {
    visible: Boolean,
    lineList: Array
  },
  data () {
    return {
      checkList: [],
      text: null
    }
  },
  computed: {
    checkLineList () {
      let list = this.checkList.map(id => {
        let obj = this.lineList.find(t => t.id == id)
        return obj
      })
      return list
    }
  },
  methods: {
    handleCheckedCitiesChange () {
      // console.log(val)
      let list = this.checkLineList
      let sb = ''
      for (let i = 0; i < list.length; i++) {
        const lineObj = list[i];
        let st = LineToString(lineObj.line)
        sb += '|' + st
      }
      if (sb.length) {
        sb = sb.substr(1)
      }
      this.text = sb
      this.$emit('exportLine', list.map(t => t.id))
    }
  }
}
</script>
<style lang="scss" scoped>
.export-container {
  position: absolute;
  right: 0px;
  top: 45px;
  width: 400px;
  height: calc(100% - 50px);
  background-color: #fff;
}
</style>
