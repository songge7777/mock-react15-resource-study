// import React from 'react';
// import ReactDom from 'react-dom'
// ReactDom.render('hello',document.getElementById('root'))

import React from './react';
// jsx 需要用babel转成js
function sayHello(){
  alert('hello')
}
// let element = (
//   <button id='sayHello' style={{color:'red'}} onClick={sayHello}>
//     say
//     <b>
//       hello
//     </b>
//   </button>
// )
// babel把上面的转成下面这样
let element = React.createElement('button',
  {id:'sayHello',style:{color:'red',backgroundColor:'green'},onClick:sayHello},
  'say',
  React.createElement('b',{},'Hello')
)
// 虚拟DOM DOM-DIFF就是对虚拟DOM进行比较
// {type:'button',props:{id:'sayHello'}}

class Counter extends React.Component{
  constructor(props){
    super(props);
    this.state = {number:0}
  }
  componentWillMount(){
    console.log('Counter componentWillMount')
  }
  componentDidMount(){
    setInterval(()=>{
      this.setState({number:this.state.number+1})
    },1000)
  }
  shouldComponentUpdate(nextProps,nextState){
    return true
  }
  componentDidUpdate(){
    console.log('Counter componentDidUpdate')
  }
  render(){
    // console.log('render')
    // let p = React.createElement('P',{style:{color:'red'}},this.props.name,this.state.number)
    // let button = React.createElement('button',{onClick:this.increment},'+')
    // return React.createElement('div',{id:'counter'},p,button)
    return this.state.number
  }
}
let element1 = React.createElement(Counter,{name:'计数器'})
React.render(element1,document.getElementById('root'))