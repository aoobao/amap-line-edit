// const STATUS = {
//   VIEW: 0, // 查看模式
//   CLEAR: 1, // 清除模式
//   EDIT: 2 // 编辑模式
// }

/**
 * opt
 * color : String 线段默认颜色 '#fff'
 * pointSize : Number 点位大小 3
 * pointColor : String 点位颜色 默认线段颜色
 * lastPointColor : String 最后一个点的颜色 'red'
 * lastPointSize : Number 最后一个点的大小,默认pointSize
 */
export default class LineManager {
  constructor(map, opt) {
    this._initialize(map, opt || {})
  }

  // static STATUS = {
  //   VIEW: 0, // 查看模式
  //   CLEAR: 1, // 清除模式
  //   EDIT: 2 // 编辑模式
  // }
  static VIEW = 0
  static CLEAR = 1
  static EDIT = 2

  _initialize(map, opt) {
    this._map = map
    this._color = opt.color || 'yellow'
    this._pointSize = opt.pointSize || 3
    this._pointColor = opt.pointColor || this._color
    this._lastPointColor = opt.lastPointColor || 'red'
    this._lastPointSize = opt.lastPointSize || this._pointSize

    // this._status = LineManager.STATUS.VIEW // 默认查看模式

    this._status = LineManager.VIEW
    this._lines = []
    this._createCustomLayer()

    this.show()
  }

  _createCustomLayer() {
    let canvas = this._canvas = document.createElement('canvas')
    this._ctx = canvas.getContext('2d')
    let size = this._map.getSize()
    canvas.width = this._width = size.width
    canvas.height = this._height = size.height

    this._cus = new AMap.CustomLayer(canvas, {
      zIndex: 10
    })

    this._cus.render = this._redraw.bind(this)

  }

  _redraw() {
    this._lines = this._lines.map(lineObj => {
      let pixels = lineObj.line.map(t => this._map.lngLatToContainer(t))
      let obj = {
        ...lineObj,
        pixels
      }
      return obj
    })
    this._draw()
  }

  _draw() {
    this._clearCanvas()
    this._drawCanvas()
  }

  _clearCanvas() {
    this._ctx.clearRect(0, 0, this._width, this._height)
  }

  _drawCanvas() {
    if (!this._lines || this._lines.length == 0) return
    let ctx = this._ctx
    ctx.save()
    this._lines.forEach(lineObj => {
      let pixels = lineObj.pixels
      // fix : 当线段全部被擦除的时候,pixels数组为空,跳过绘制 2019-4-25
      if (pixels && pixels.length > 0) {
        // 线条颜色
        ctx.strokeStyle = lineObj.color ? lineObj.color : this._color
        ctx.lineWidth = 1
        ctx.beginPath()
        for (let i = 0; i < pixels.length; i++) {
          let pixel = pixels[i];
          ctx.lineTo(pixel.getX(), pixel.getY())
        }

        // ctx.closePath()
        ctx.stroke()

        // 如果当前状态不是查看状态,并且该线段没有标记锁定, 标记出每个点位. 
        if (this._status != LineManager.VIEW && !lineObj.lock) {
          ctx.fillStyle = lineObj.pointColor ? lineObj.pointColor : this._pointColor
          for (let i = 0; i < pixels.length; i++) {
            const pixel = pixels[i];
            ctx.beginPath()
            ctx.arc(pixel.getX(), pixel.getY(), lineObj.pointSize || this._pointSize, 0, 2 * Math.PI)
            ctx.fill()
          }
        }

        // 绘制最后一个点
        let pixel = pixels[pixels.length - 1] // 最后一个点
        ctx.fillStyle = lineObj.lastPointColor || this._lastPointColor
        ctx.beginPath()
        ctx.arc(pixel.getX(), pixel.getY(), lineObj.lastPointSize || this._lastPointSize, 0, 2 * Math.PI)
        ctx.fill()
      }
    });

    ctx.restore()
  }

  // 生成线段
  createLine(list) {
    return new Promise(resolve => {
      let canvas = document.createElement('canvas')
      canvas.width = this._width
      canvas.height = this._height
      let ctx = canvas.getContext('2d')
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 2
      ctx.beginPath()
      for (let i = 0; i < list.length; i++) {
        const point = list[i];
        let pixel = this._map.lngLatToContainer(point)
        ctx.lineTo(pixel.getX(), pixel.getY())
      }
      ctx.stroke()
      let dataUrl = canvas.toDataURL('image/png', 1.0)
      resolve(dataUrl)
    })
  }

  getLineList() {
    let list = this._lines.map(lineObj => {
      let obj = {
        ...lineObj,
        pixels: null
      }
      delete obj.pixels
      return obj
    })
    return list.filter(t => t.line && t.line.length > 0)
  }

  // 擦除
  clearLine(pixel, clearWidth) {
    // console.log(pixel, clearWidth)
    let flag = false
    let lines = this._lines.map(lineObj => {
      if (lineObj.lock) return lineObj
      let obj = this.filterPixels(lineObj, pixel, clearWidth)
      if (obj == null) {
        return lineObj
      } else {
        flag = true
        return obj
      }
    })
    if (flag) {
      this._lines = lines
      this._draw()
    }
  }

  filterPixels(lineObj, pixel, clearWidth) {
    let minX = pixel.getX() - clearWidth / 2
    let minY = pixel.getY() - clearWidth / 2
    let maxX = pixel.getX() + clearWidth / 2
    let maxY = pixel.getY() + clearWidth / 2
    let rowIndex = null

    let pixels = lineObj.pixels
    let lines = lineObj.line
    let points = []
    let pointPixels = []
    for (let i = 0; i < pixels.length; i++) {
      const p = pixels[i]
      let line = lines[i]
      // 判断当前点位是否在擦除范围内.
      if (isInPath(p, minX, minY, maxX, maxY)) {
        if (rowIndex == null) rowIndex = i - 1 // 拿到上一个点位.
      } else {
        if (rowIndex != null) { // 已经有点被擦除.
          points.push(line)
          pointPixels.push(p)
        }
      }
    }
    // 有点位被擦除
    if (rowIndex != null) {
      if (rowIndex > -1) { // 将头部的点加到新数组的末尾.
        points.push(...lines.slice(0, rowIndex + 1))
        pointPixels.push(...pixels.slice(0, rowIndex + 1))
      }
      return {
        ...lineObj,
        pixels: pointPixels,
        line: points
      }
    } else {
      // 没有点位被擦除,不需要修改,返回null,优化性能
      return null
    }
  }


  setClearModel() {
    // this._status = LineManager.STATUS.CLEAR
    this._map.setStatus({
      dragEnable: false
    })
    this._status = LineManager.CLEAR
    this._draw()
  }

  setViewModel() {
    this._map.setStatus({
      dragEnable: true
    })
    this._status = LineManager.VIEW
    this._draw()
  }

  setEditModel() {
    this._map.setStatus({
      dragEnable: true
    })
    this._status = LineManager.EDIT
    this._draw()
  }

  /**
   * 重新渲染数据
   * @param {Array<Opt>} list 
   * opt :
   * color : String 线段默认颜色 '#fff'
   * pointSize : Number 点位大小 3
   * pointColor : String 点位颜色 默认线段颜色
   * lastPointColor : String 最后一个点的颜色 'red'
   * lastPointSize : Number 最后一个点的大小,默认pointSize
   * lock : Bool  true代表不可擦除,编辑
   */
  setData(list) {
    this._lines = list

    this._redraw()
  }

  show() {
    this._cus.setMap(this._map)
  }

  hide() {
    this._cus.setMap(null)
  }

  destroy() {
    this.hide()
  }
}

function isInPath(pixel, minX, minY, maxX, maxY) {
  let x = pixel.getX()
  let y = pixel.getY()
  if (x >= minX && x <= maxX) {
    if (y >= minY && y <= maxY) {
      return true
    }
  }
  return false
}