// import React from 'react';
// import ReactDom from 'react-dom'
// ReactDom.render('hello',document.getElementById('root'))

import React from './react';
// jsx 需要用babel转成js
// function sayHello(){
//   alert('hello')
// }
// let element = (
//   <button id='sayHello' style={{color:'red'}} onClick={sayHello}>
//     say
//     <b>
//       hello
//     </b>
//   </button>
// )
// babel把上面的转成下面这样
// let element = React.createElement('button',
//   {id:'sayHello',style:{color:'red',backgroundColor:'green'},onClick:sayHello},
//   'say',
//   React.createElement('b',{},'Hello')
// )
// React.render(element,document.getElementById('root'))

// 虚拟DOM DOM-DIFF就是对虚拟DOM进行比较
// {type:'button',props:{id:'sayHello'}}

class Counter extends React.Component{
  constructor(props){
    super(props);
    this.state = {number:0,odd:true}
  }
  componentWillMount(){
    console.log('Counter componentWillMount')
  }
  componentDidMount(){
    setTimeout(()=>{
      console.log('==>')
      this.setState({odd:!this.state.odd})
    },1000)
  }
  shouldComponentUpdate(nextProps,nextState){
    return true
  }
  componentDidUpdate(){
    // console.log('Counter componentDidUpdate')
  }
  handleClick = ()=>{
    // console.log('===')
    this.setState({number:this.state.number+1})
  }
  render(){
    // 1、
    // return this.state.number
    
    // 2、
    // console.log('render')
    // let p = React.createElement('P',{},this.state.number)
    // let button = React.createElement('button',{onClick:this.handleClick},'+')
    // return React.createElement('div',{style:{color:this.state.number%2===0?"red":"green",background:this.state.number%2===0?"green":"red"}},p,button)
    
    // 3、
    if(this.state.odd){
      return  React.createElement('ul',{},
        React.createElement('li',{key:'A'},'A'),
        React.createElement('li',{key:'B'},'B'),
        React.createElement('li',{key:'C'},'C'),
        React.createElement('li',{key:'D'},'D'),
      )
    }else{
      return  React.createElement('ul',{},
        React.createElement('span',{key:'A'},'A11111'),
        React.createElement('li',{key:'C'},'C1'),
        React.createElement('li',{key:'B'},'B1'),
        React.createElement('li',{key:'E'},'E1'),
        React.createElement('li',{key:'F'},'F1'),
      )}
  }
}
let element1 = React.createElement(Counter,{name:'计数器'})
React.render(element1,document.getElementById('root'))

// import React from './react'
// class Todos extends React.Component{
//   constructor(props){
//     super(props)
//     this.state = {list:[],text:''}
//   }
//   onChange = (event)=>{
//     this.setState({text:event.target.value})
//   }
//   handleClick = (event)=>{
//     let text = this.state.text
//     this.setState({
//       list:[...this.state.list,text],text:''
//     })
//   }
//   onDel = (index)=>{
//     this.setState({
//       list:[...this.state.list.slice(0,index),...this.state.list.slice(index+1)]
//     })
//   }
//   render(){
//     let lists = this.state.list.map((item,index)=>{
//       return React.createElement('div',{},item,React.createElement('button',{onClick:()=>this.onDel(index)},'x'))
//     })
//     let input = React.createElement('input',{onKeyup:this.onChange,value:this.state.text})
//     let button = React.createElement('button',{onClick:this.handleClick},'+')
//     return (
//       React.createElement('div',{},input,button,...lists)
//     )
//   }
// }
// let element = React.createElement(Todos,{name:'计数器'})
// React.render(element,document.getElementById('root'))