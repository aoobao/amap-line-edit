export default class MouseTool {
  constructor(map, opt) {
    this._initialize(map, opt || {})
  }
  _initialize(map, opt) {
    this._map = map
    this._drawEvent = opt.drawEvent
    this._fillColor = opt.fillColor || '#ffecb3'
    this._fillOpacity = opt.fillOpacity || 0.4
    this._strokeColor = opt.strokeColor || '#ffecb3'
    this._strokeOpacity = opt.strokeOpacity || 1
    this._callback = opt.callback
    // this._drawType = opt.drawType || 'polyline'

  }

  startDraw() {
    if (!this._mouseTool) {
      this._mouseTool = new AMap.MouseTool(this._map)
      this._mouseTool.polyline({
        fillColor: this._fillColor,
        fillOpacity: this._fillOpacity,
        strokeColor: this._strokeColor,
        strokeOpacity: this._strokeOpacity
      })

      this._mouseTool.on('draw', e => {
        // console.log(e)
        let lineObj = e.obj
        lineObj.setMap(null)
        typeof this._callback && this._callback(e)
      })
    }
    // this._map.setDefaultCursor('crosshair')
  }

  endDraw() {
    if (this._mouseTool) {

      this._mouseTool.close()
      // this._mouseTool.setMap(null)
      this._mouseTool.g = null
      this._mouseTool = null
    }
  }

  destory() {
    this.endDraw()
  }

}