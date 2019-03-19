<template>
  <el-dialog title="合并线段" width="840px" :visible="visible" :center="false" :before-close="handleClose">
    <div class="context">

      <div class="select-container">
        <span class="title">待合并线段</span>
        <el-button style="margin-left:10px;" @click="addLine(item,index)" v-for="(item,index) in chooseList" :key="item.key">{{item.label}}</el-button>
      </div>
      <div class="image-container" :style="getImageStyle()">
        <!-- <img v-if="base64" :src="base64" alt=""> -->
      </div>
      <div style="clear :both;"></div>
      <span class="title">需合并线段</span>
      <div class="choose-model">
        <el-tag style="margin-left:10px;" v-for="(item,index) in data" :key="item.key" closable @close="tagClose(item,index)">{{item.label}}</el-tag>
      </div>
    </div>

    <span slot="footer" class="dialog-footer ">
      <el-button type="primary " @click="submit ">确 定</el-button>
      <el-button type="primary " @click="createImage ">生成图片</el-button>
    </span>
  </el-dialog>

</template>
<script>
export default {
  props: {
    dataList: Array,
    base64: String
  },
  data () {
    return {
      visible: false,
      data: []
    }
  },
  computed: {
    chooseList () {
      let list = this.dataList.filter(t => {
        let m = this.data.find(a => a.key == t.key)
        return !m
      })
      return list
    }
  },
  methods: {
    handleClose () {
      this.visible = false
      this.$emit('close')
    },
    show () {
      this.visible = true
    },
    submit () {
      this.$emit('merge', {
        data: this.data
      })
      this.visible = false
    },
    createImage () {
      this.$emit('createImage', {
        data: this.data
      })
    },
    addLine (data) {
      this.data.push(data)
    },
    tagClose (item, index) {
      this.data.splice(index, 1)
    },
    getImageStyle () {
      return {
        backgroundImage: `url('${this.base64}')`
      }
    }
  },
  watch: {
    visible (val) {
      if (!val) {
        this.data = []
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.select-container {
  width: 50%;
  height: 150px;
  background-color: aqua;
  text-align: left;
  float: left;
}
.image-container {
  width: 50%;
  height: 150px;
  float: left;
  //overflow: auto;
  background-size: contain;
  background-repeat: no-repeat;
}

.title {
  text-align: left;
}
.choose-model {
  text-align: left;
}
</style>
