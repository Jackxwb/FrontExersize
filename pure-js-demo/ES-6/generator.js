function* g() {
  yield 1
  let x = yield 2
  console.log(x)
  return undefined //默认省略
}

var gen = g()
console.log(gen.next())
console.log(gen.next())
console.log(gen.next(5))
console.log('--------------->>>')
console.log(gen.next())

function exchange(arr, from, to) {
  // arr.splice(to, 0, arr.splice(from, 1)[0])
  // console.log(arr)
  // arr[from] = arr.splice(to, 1, arr[from])[0]
  arr.splice(from, 1, arr.splice(to, 1, arr[from])[0])
  console.log(arr)
  return arr
}

var arr = [0,1,2,3,4,5]
exchange(arr, 0, 4)
// let from = Number(el.getAttribute('index'))-1,
// index = Number(sibling.getAttribute('index'))-1
// // console.log(from, index, '拖拽结束了---->>>>>>')
// this.services.splice(index, 0, this.services.splice(from, 1)[0])