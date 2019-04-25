<script>
// 线段编辑
export default {
  render () { return null },
  props: {
    draw: {
      type: Boolean,
      default: false
    }
  },
  mounted () {
    if (this.draw) {
      this.initDraw()
    }
  },
  beforeDestroy () {
    if (this.draw) this.destory()
  },
  methods: {
    initDraw () {

    },
    destory () {

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
