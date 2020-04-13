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
  update(nextElement){
    if(this._currentElement !== nextElement){
      this._currentElement = nextElement
      $(`[data-reactid="${this._reactid}"]`).html(this._currentElement)
    }
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
class CompositeUnit extends Unit {
  // 这里负责处理组件的更新操作
  update(nextElement,partialState){
    // 先获取到新元素
    this._currentElement = nextElement
    // 获取新的状态,不管要不要更新组件,组件的状态一定要修改
    let nextState = this._componentInstance.state = Object.assign(this._componentInstance.state,partialState);
    // 新的属性对象
    let nextProps = this._currentElement
    if(this._componentInstance.shouldComponentUpdate && !this._componentInstance.shouldComponentUpdate(nextProps,nextState)){
      return;
    }
    // 下面要进行比较更新  先得到上次渲染的单元
    let preRenderedUnitInstance = this._renderedUnitInstance

    // 得到上次渲染的元素
    let preRenderedElement  = preRenderedUnitInstance._currentElement
    // 更新后的元素
    let nextRenderElement = this._componentInstance.render();
    // 如果新旧两个元素类型一样,则可以进行深度比较,如果不一样,直接干掉老的元素，新建新的
    if(shouldDeepCompare(preRenderedElement,nextRenderElement)){
      // 如果可以进行深比较,则把更新的工作交给上次渲染出来的那个element元素对应的unit来处理
      preRenderedUnitInstance.update(nextRenderElement)
      // 更新完成
      this._componentInstance.componentUpdate&&this._componentInstance.componentUpdate()
    }else{
      this._renderedUnitInstance = createUnit(nextRenderElement);
      let nextMarkUp = this._renderedUnitInstance.getMarkUp(this._reactid)
      $(`[data-reactid]="${this._reactid}"`).replaceWith(nextMarkUp)
    }

  }
  getMarkUp(reactid) {
    this._reactid = reactid
    let { type: Component, props } = this._currentElement
    let componentInstance = this._componentInstance = new Component(props)
    // 让组件的实例的currentUnit的属性等于当前的unit
    this._componentInstance._currentUnit = this;
    // 生命周期 如果有的话就让他执行
    componentInstance.componentWillMount && componentInstance.componentWillMount()
    // 调用组件的render方法 获得要渲染的元素
    let renderedElement = this._renderedElement = componentInstance.render();
    // 得到这个元素对应的unit
    let renderedUnitInstance = this._renderedUnitInstance = createUnit(renderedElement)
    // 通过unit可以获取它的html 标记markup
    let renderedMarkUp = renderedUnitInstance.getMarkUp(this._reactid);
    // 在这个时候绑定一个事件
    $(document).on('mounted', () => {
      componentInstance.componentDidMount && componentInstance.componentDidMount()
    })
    return renderedMarkUp
  }
}
// 判断两个元素的类型一样不一样
function shouldDeepCompare(oldElement,newElement){
  if(oldElement != null && newElement != null){
    let oldType = typeof oldElement
    let newType = typeof newElement;
    // 都是文本型
    if((oldType === 'string' || oldType === 'number')&&(newType === 'string'||newType === 'number')){
      return true
    }
    if(oldElement instanceof Element && newElement instanceof Element){
      return oldElement.type === newElement.type
    }
    return false
  }
  return false
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