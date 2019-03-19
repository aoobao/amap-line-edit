<template>
  <el-dialog title="导出线段" width="840px" :visible="visible" :before-close="handleClose">
    <el-input type="textarea" :rows="10" :value="value"></el-input>
  </el-dialog>
</template>
<script>
export default {
  props: {
    value: String
  },
  data () {
    return {
      visible: false
    }
  },
  methods: {
    handleClose () {
      this.visible = false
      this.$emit('close')
    },
    show () {
      this.visible = true
    }
  }
}
</script>
