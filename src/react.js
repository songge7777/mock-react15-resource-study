import $ from 'jquery';
import {createUnit} from './unit'
import {createElement} from './element'
import {Component} from './component'
let React = {
  render,
  createElement,
  Component
}
// 此元素可能是一个文本节点、DOM节点、或者 自定义组件Counter
function render(element,container){
  // container.innerHTML = `<span data-reactId="${React.rootIndex}">${element}</span>`
  // unit单元就是用来负责渲染的 负责把元素转换成可以在页面上显示的HTML字符串
  let unit = createUnit(element)
  let markUp =  unit.getMarkUp('0');//用来返回HTML标记
  $(container).html(markUp);
  // 挂载完成后 触发mounted
  $(document).trigger('mounted')
}

export default React;