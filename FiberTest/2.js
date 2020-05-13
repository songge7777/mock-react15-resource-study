// 以前的递归
// 问题 1、不能中断  2、执行栈太深
let root = {
  key:'A1',
  children:[
    {
      key:'B1',
      children:[
        {
          key:'C1',children:[]
        },
        {
          key:'C2',children:[]
        }
      ]
    },
    {
      key:'B2',children:[]
    }
  ]
}
function walk(vdom){
  doWork(vdom)
  // 深度优先遍历
  vdom.children.forEach((child)=>{
    walk(child)
  })
}
function doWork(vdom){
  console.log(vdom.key)
}
walk(root)

// fiber 有3个属性
// const Fiber ={
//   retrun :Fiber,
//   child:Fiber,
//   subling:Fiber
// }

// Fiber执行阶段
// 每次渲染有2个阶段:协调和提交
// 协调阶段:可以认为是Diff阶段 这个阶段可以被中断,这个阶段会找出所有的节点变更,例如节点新增,删除,属性变更等等,这些变更React称之为副作用(Effect)
// 提交阶段:将上一个阶段计算出来的需要处理副作用一次性执行了 这个阶段必须同步执行 不能被打断