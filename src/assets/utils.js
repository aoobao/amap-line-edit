export function transposePolyrect(coordinate, sep = '|') {
  var arr = []
  let pattern = /\d+(\.\d+)?/g
  if (typeof coordinate === 'string') {
    let temp = coordinate.split(sep)
    temp.forEach(t => {
      if (t) {
        let re = [];
        let mat = t.match(pattern);
        for (var i = 1; i < mat.length; i += 2) {
          var x = parseFloat(mat[i - 1]);
          var y = parseFloat(mat[i]);
          re.push([x, y]);
        }
        arr.push(re)
      }
    })
  } else {
    console.warn('经纬度格式有误:', coordinate)
  }
  return arr;
}

export function LineToString(arr) {
  let st = arr.toString()
  st = st.replace(/(\d+(\.\d+)?,\d+(\.\d+)?)(,|$)/g, '$1;');
  return st;
}