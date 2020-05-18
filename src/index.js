import React from './react';
import ReactDOM from './react-dom';

// useState 是一个语法糖, 基于useReducer
class ClassCounter extends React.Component{
  constructor(props){
    super(props)
    this.state = {number:0}
  }
  onClick = ()=>{
    this.setState(state => ({number:state.number+1}))
  }
  render(){
    return (
      <div id='counter'>
        <span>{this.state.number}</span>
        <button onClick={this.onClick}>加1</button>
      </div>
    )
  }
}
const ADD = 'ADD';
function reducer(state,action){
  switch(action.type){
    case ADD:
      return {count:state.count+1}  
    default:
      return state;
  }
}
function FunctionCounter(){
  // hooks 不能修改数量  不能放在if中  因为内部 比较的时候 是一一对应的通过索引
  const [numberState,setNumberState] = React.useState({number:0});
  const [countState,dispatch] = React.useReducer(reducer,{count:0});
  return (
    <div>
      <div id='counter'>
        <span>{numberState.number}</span>
        <button onClick={()=>setNumberState({number:numberState.number+1})}>加1</button>
      </div>
      <div id='counter2'>
        <span>{countState.count}</span>
        <button onClick={()=>dispatch({type:ADD})}>加1</button>
      </div>
    </div>
  )
}
ReactDOM.render(<FunctionCounter name='计数器'/>,document.getElementById('root'))

// JSX 其实就是一种特殊的语法 在webpack打包的时候 babel编译的时候回编译成JS
// let style = { border:'3px solid red',margin:'5px'}
// let element = (
//   <div id='A1' style={style}>
//     A1
//     <div id='B1' style={style}>
//       B1
//       <div id='C1' style={style}>C1</div>
//       <div id='C2' style={style}>C2</div>
//     </div>
//     <div id='B2' style={style}>B2</div>
//   </div>
// )
// console.log(element)

// ReactDOM.render(
//   element,
//   document.getElementById('root')
// )

// // 组件更新
// let render2 = document.getElementById('render2');
// render2.addEventListener('click',()=>{
//   let element2 = (
//     <div id='A1-new' style={style}>
//       A1-new
//       <div id='B1-new' style={style}>
//         B1-new
//         <div id='C1-new' style={style}>C1-new</div>
//         <div id='C2-new' style={style}>C2-new</div>
//       </div>
//       <div id='B2-new' style={style}>B2-new</div>
//       <div id='B3' style={style}>B3</div>
//     </div>
//   )
//   ReactDOM.render(
//     element2,
//     document.getElementById('root')
//   )
// })

// // 组件更新
// let render3 = document.getElementById('render3');
// render3.addEventListener('click',()=>{
//   let element3 = (
//     <div id='A1-new2' style={style}>
//       A1-new2
//       <div id='B1-new2' style={style}>
//         B1-new2
//         <div id='C1-new2' style={style}>C1-new2</div>
//         <div id='C2-new2' style={style}>C2-new2</div>
//       </div>
//       <div id='B2-new' style={style}>B2-new2</div>
//     </div>
//   )
//   ReactDOM.render(
//     element3,
//     document.getElementById('root')
//   )
// })