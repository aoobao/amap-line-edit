<template>
  <el-dialog title="添加线段" width="840px" :visible="visible" :before-close="handleClose">
    <el-input v-model="name" placeholder="请输入名称"></el-input>
    <el-input style="margin-top:10px;" type="textarea" v-model="text" :rows="10" placeholder="输入内容x,y;x,y"></el-input>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submit">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script>
export default {
  data () {
    return {
      visible: false,
      text: '',
      name: ''
    }
  },
  methods: {
    handleClose () {
      this.visible = false
    },
    show () {
      this.visible = true
    },
    submit () {

      this.$emit('add', {
        name: this.name,
        text: this.text
      })
      this.visible = false
    }
  },
  watch: {
    visible (val) {
      if (!val) {
        this.text = ''
        this.name = ''
      }
    }
  }
}
</script>
