<template>
  <div class="line-container">
    <div v-if="isClear" class="clearRect" :style="clearStyle()"></div>
  </div>
</template>


<script>
import LineManager from '../assets/LineManager'
export default {
  props: {
    map: {
      type: Object,
      required: true
    },
    data: {
      type: Array
    },
    status: {
      type: Number
    },
    clearWidth: {
      type: Number,
      default: 10
    },
    x: Number,
    y: Number
  },
  data () {
    return {
      down: false
    }
  },
  computed: {
    isClear () {
      return this.status == LineManager.CLEAR
    }
  },
  created () {
    // this.map.on('mousemove', this.mapMouseMove, this)
    this.map.on('mousedown', this.mapMouseDown, this)
    this.map.on('mouseup', this.mapMouseUp, this)
    this.map.on('mousemove', this.mapMouseMove, this)
    this.manager = new LineManager(this.map, {
      color: 'blue',
      pointSize: 3,
      lastPointSize: 6
    })
    if (this.data.length > 0) {
      this.manager.setData(this.data)
    }
  },
  beforeDestroy () {

    if (this.manager) {
      this.manager.destroy()
      this.manager = null
    }
    if (this.map) {
      this.map.off('mousedown', this.mapMouseDown, this)
      this.map.off('mousedown', this.mapMouseUp, this)
      this.map.off('mousemove', this.mapMouseMove, this)
    }
  },
  methods: {
    mapMouseUp () {
      this.down = false
    },
    mapMouseDown (e) {
      // console.log(e)
      this.down = true
      if (this.manager) {
        this.manager.clearLine(e.pixel, this.clearWidth)
      }
    },
    mapMouseMove (e) {
      // console.log(e)
      if (this.down && this.manager) {
        this.manager.clearLine(e.pixel, this.clearWidth)
      }
    },
    draw () {
      if (this.manager) {
        this.manager._draw()
      }
    },
    clearStyle () {
      let opt = {}
      if (this.isClear) {
        opt = {
          top: this.y + 'px',
          left: this.x + 'px',
          width: this.clearWidth + 'px',
          height: this.clearWidth + 'px',
          marginLeft: -(this.clearWidth / 2) + 'px',
          marginTop: -(this.clearWidth / 2) + 'px'
        }
      } else {
        opt = {
          display: 'none'
        }
      }

      return opt
    },
    getLineList () {
      if (this.manager) {
        return this.manager.getLineList()
      } else {
        return []
      }
    },
    createLine (list) {
      return new Promise(resolve => {
        if (this.manager) {
          this.manager.createLine(list).then(base64 => {
            resolve(base64)
          })
        }
      })

    }
  },
  watch: {
    data (list) {
      if (this.manager) {
        this.manager.setData(list)
      }
    },
    status (val) {
      if (this.manager) {
        if (val == LineManager.VIEW) {
          this.manager.setViewModel()
        } else if (val == LineManager.CLEAR) {
          this.manager.setClearModel()
        } else if (val == LineManager.EDIT) {
          this.manager.setEditModel()
        }
      }

    }
  }
}
</script>
<style lang="scss" scoped>
.clearRect {
  position: absolute;
  background-color: red;
  pointer-events: none;
}
</style>
