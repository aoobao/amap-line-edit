<script>
// 线段编辑
import MouseTool from '@/assets/MouseTool'
export default {
  render () { return null },
  props: {
    draw: {
      type: Boolean,
      default: false
    },
    map: {
      type: Object,
      required: true
    }
  },
  mounted () {
    this.$mouseTool = new MouseTool(this.map, {
      strokeColor: 'red',
      callback: this.drawCallback.bind(this)
    })
    if (this.draw) {
      this.initDraw()
    }
  },
  beforeDestroy () {
    if (this.draw) this.destory()
    this.$mouseTool.destory()
    this.$mouseTool = null
  },
  methods: {
    drawCallback (e) {
      // console.log(e, this)
      let lineObj = e.obj
      let path = lineObj.getPath()
      let list = path.map(t => {
        return [t.getLng(), t.getLat()]
      })
      this.$emit('draw', list)
    },
    initDraw () {
      this.$mouseTool.startDraw()
    },
    destory () {
      if (this.$mouseTool) {
        this.$mouseTool.endDraw()
      }
    }
  },
  watch: {
    draw (val, oldval) {
      if (val != oldval) {
        if (val) {
          this.initDraw()
        } else {
          this.destory()
        }
      }
    }
  }
}
</script>
