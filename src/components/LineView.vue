<template>
  <div class="line-container" @mouseout="mouseout" @mouseover="mouseover">
    <!-- <span class="name">{{name}} {{startPointName}}</span> -->
    <div style="width:150px;margin-right:5px;margin-left:5px;" class="input-container">
      <el-input size="mini" :value="name" @input="changeName"></el-input>
    </div>

    <el-button type="success" size="mini" @click="reverse">反转</el-button>
    <el-button @click="remove" type="danger" icon="el-icon-delete" size="mini" circle></el-button>
    <el-button type="primary" size="mini" @click="copyLine">导出</el-button>
    <el-switch :value="data.lock" size="mini" style="margin-left:5px;" @input="changeLock"></el-switch>

  </div>
</template>
<script>
export default {
  props: {
    data: {
      type: Object,
      required: true
    }
  },
  computed: {
    name () {
      if (this.data) {
        return this.data.name
      }
      return '无'
    },
    startPoint () {
      if (this.data) {
        let list = this.data.line
        if (list && list.length > 0) {
          return list[0]
        }
      }
      return null
    },
    // startPointName () {
    //   if (this.startPoint) {
    //     return `${this.startPoint[0].toFixed(3)},${this.startPoint[1].toFixed(3)}...`
    //   }
    //   return ''
    // }
  },
  methods: {
    changeName (val) {
      this.$emit('input', val)
    },
    changeLock () {
      this.$emit('lock')
    },
    remove () {
      this.$emit('remove')
    },
    reverse () {
      this.$emit('reverse')
    },
    mouseout () {
      this.$emit('mouseout')
    },
    mouseover () {
      this.$emit('mouseover')
    },
    copyLine () {
      this.$emit('copyLine')
    }
  }
}
</script>

<style lang="scss" scoped>
.line-container {
  width: 400px;
  height: 40px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  // margin-left: 10px;
  margin-top: 10px;
  &:hover {
    background-color: aquamarine;
  }
  .name {
    // color: #fff;

    margin-left: 10px;
    margin-right: 10px;
  }
}
</style>
