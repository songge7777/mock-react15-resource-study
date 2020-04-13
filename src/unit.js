import $ from 'jquery';
import { Element, createElement } from './element'
class Unit {
  constructor(element) {
    // 凡是挂载到私有属性的都是_开头
    this._currentElement = element
  }
  getMarkUp() {
    throw Error('此方法不能被调用');
  }
}
class TextUnit extends Unit {
  getMarkUp(reactid) {
    this._reactid = reactid
    return `<span data-reactId="${reactid}">${this._currentElement}</span>`
  }
}
/*
  {type:'button',props:{id:'sayHello'},children:['say',{type:'b',{},'hello'}]}
  <button id='sayHello' style="color:red" onClick="sayHello()">
    <span>say</span>
    <b>Hello</b>
  </button>
*/
class NativeUnit extends Unit {
  getMarkUp(reactid) {
    this._reactid = reactid
    let { type, props } = this._currentElement
    let tagStart = `<${type} data-reactid="${this._reactid}"`;
    let childString = '';
    let tagEnd = `</${type}>`
    // {id:'sayHello',style={color:red} onClick="sayHello()"}
    for (let propName in props) {
      if (/^on[A-z]/.test(propName)) {// 这说明要绑定事件了
        let eventName = propName.slice(2).toLocaleLowerCase();
        // 事件委托
        $(document).delegate(`[data-reactid="${this._reactid}"]`, `${eventName}.${this._reactid}`, props[propName])
      } else if (propName === 'style') {// 如果是一个样式对象
        let styleObj = props[propName];
        let styles = Object.entries(styleObj).map(([attr, value]) => {
          attr = attr.replace(/[A-Z]/g, m => `-${m.toLocaleLowerCase()}`)
          return `${attr}:${value}`;
        }).join(';')
        tagStart += (`style="${styles}"`)
      } else if (propName === 'className') {// 如果是一个样式对象
        tagStart += (`class="${props[propName]}"`)
      } else if (propName === 'children') {
        let children = props[propName]
        children.map((child, index) => {
          let childUnit = createUnit(child);// 可能是一个字符串 也可能是一个react元素  
          let childMarkUp = childUnit.getMarkUp(`${this._reactid}.${index}`);
          childString += childMarkUp;
        })
      } else {
        tagStart += (` ${propName}=${props[propName]} `)
      }
    }
    return tagStart + '>' + childString + tagEnd;
  }
}
class CompositeUnit extends Unit{
  getMarkUp(reactid) {
    this._reactid = reactid
    let {type:Component,props} = this._currentElement
    let componentInstance = this._componentInstance = new Component(props)
    // 让组件的实例的currentUnit的属性等于当前的unit
    this._componentInstance.currentUnit = this;
    // 生命周期 如果有的话就让他执行
    componentInstance.componentWillMount && componentInstance.componentWillMount()
    // 调用组件的render方法 获得要渲染的元素
    let renderedElement = this._renderedElement =componentInstance.render();
    // 得到这个元素对应的unit
    let renderedUnitIntance = this._renderedUnitIntance = createUnit(renderedElement)
    // 通过unit可以获取它的html 标记markup
    return renderedUnitIntance.getMarkUp(this._reactid);
  }
}
function createUnit(element) {
  if (typeof element === 'string' || typeof element === 'number') {
    return new TextUnit(element)
  }
  //  element.type === 'string' 处理原生的dom 防止类组件或者函数组件
  if (element instanceof Element && typeof element.type === 'string') {
    return new NativeUnit(element)
  }
  // 类最终转成函数
  if (element instanceof Element && typeof element.type === 'function') {
    return new CompositeUnit(element)
  }
}

export {
  createUnit
}