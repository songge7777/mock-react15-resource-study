import $ from 'jquery';
import { Element, createElement } from './element'
import types from './types';
let diffQueue=[];//差异队列
let updateDepth=0;//更新的级别
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
    this._renderedChildrenUnits = []
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
          childUnit._mountIndex = index;//每个unit有一个_mountIndex 属性 指向自己在父节点中的索引位子
          // 将子元素的unit保存起来
          this._renderedChildrenUnits.push(childUnit)
          let childMarkUp = childUnit.getMarkUp(`${this._reactid}.${index}`);
          childString += childMarkUp;
        })
      } else {
        tagStart += (` ${propName}=${props[propName]} `)
      }
    }
    return tagStart + '>' + childString + tagEnd;
  }
  // 他没有状态 所以只有一个参数
  update(nextElement){
    // console.log(nextElement)
    let oldProps = this._currentElement.props;
    let newProps = nextElement.props
    // 比较新老属性  在原来的基础上对属性进行增删
    this.updateDOMProperties(oldProps,newProps)
    this.updateDOMChildren(nextElement.props.children);
  }
  // 此处要把新的儿子们传过来,然后和老的儿子们进行对比,然后找出差异,进行修改DOM
  updateDOMChildren(newChildrenElements){
    updateDepth++;
    this.diff(diffQueue,newChildrenElements);
    updateDepth--;
    if(updateDepth === 0){
      this.patch(diffQueue);
      diffQueue = [];
    };
  }
  // 补丁
  patch(diffQueue){
    let deleteChildren = []; // 这里要放着所又将要删除的节点
    let deleteMap = {}; //这里暂存能复用的节点
      console.log('diffQueue',diffQueue)
      // 删除
    for(let i=0;i<diffQueue.length;i++){

      let difference = diffQueue[i];
      if(difference.type === types.MOVE || difference.type === types.REMOVE){
        let fromIndex = difference.fromIndex;
        let oldChild = $(difference.parentNode.children().get(fromIndex))
        deleteMap[fromIndex] = oldChild;
        deleteChildren.push(oldChild);
      }
    } 
    $.each(deleteChildren,(idx,item)=>$(item).remove());
    
    // 插入
    for(let i=0;i<diffQueue.length;i++){
      let difference = diffQueue[i]
        switch(difference.type){
          case types.INSERT:
            this.insertChildAt(difference.parentNode,difference.toIndex,$(difference.markUp));  
          break;
          case types.MOVE:
            this.insertChildAt(difference.parentNode,difference.toIndex,deleteMap[difference.fromIndex]);
          break;
          default:
          break; 
        }
    }
  } 
  insertChildAt(parentNode,index,newNode){
    let oldChild = parentNode.children().get(index);
    oldChild?newNode.insertBefore(oldChild):newNode.appendTo(parentNode)
  }
  diff(diffQueue,newChildrenElements){
    // 第一步生成一个map, key=老的uint
    let oldChildrenUnitMap = this.getOldChildrenMap(this._renderedChildrenUnits)
    // 第二步生成一个新的儿子unit数组
    let {newChildrenUnitMap,newChildrenUnits} = this.getNewChildren(oldChildrenUnitMap,newChildrenElements)
    console.log('newChildrenUnits',newChildrenUnits)
    let lastIndex = 0;//上一个已经确定位子的索引
    for(let i=0;i<newChildrenUnits.length;i++){
      let newUnit = newChildrenUnits[i];
      // 第一个拿到的就是 newKey=A
      let newKey = (newUnit._currentElement.props&&newUnit._currentElement.props.key)||i.toString()
      let oldChildUnit = oldChildrenUnitMap[newKey];
      if(oldChildUnit === newUnit){// 如果说新老一致的话 说明复用了老节点
        if(oldChildUnit._mountIndex < lastIndex ){
          diffQueue.push({
            parentId:this._reactid,
            parentNode:$(`[data-reactid="${this._reactid}"]`),
            type:types.MOVE,
            fromIndex:oldChildUnit._mountIndex,
            toIndex:i
          })
        }
        lastIndex = Math.max(lastIndex,oldChildUnit._mountIndex)
      }else{
        // 新的节点 就去创建
        diffQueue.push({
          parentId:this._reactid,
          parentNode:$(`[data-reactid="${this._reactid}"]`),
          type:types.INSERT,
          toIndex:i,
          markUp:newUnit.getMarkUp(`${this._reactid}.${i}`)
        })
      } 
      newUnit._mountIndex = i;
    }
    for(let oldKey in oldChildrenUnitMap){
      let oldChild = oldChildrenUnitMap[oldKey]
      if(!newChildrenUnitMap.hasOwnProperty(oldKey)){
        diffQueue.push({
          parentId:this._reactid,
          parentNode:$(`[data-reactid="${this._reactid}"]`),
          type:types.REMOVE,
          fromIndex:oldChild._mountIndex
        })
      }
    }
  }
  getNewChildren(oldChildrenUnitMap,newChildrenElements){
    let newChildrenUnits = []; 
    let newChildrenUnitMap = {}
    newChildrenElements.forEach((newElement,index)=>{
      // 一定要个key,千万不要让他走内部的索引key
      let newKey = (newElement.props && newElement.props.key)|| index.toString()
      let oldUnit = oldChildrenUnitMap[newKey];// 找到老的unit
      let oldElement = oldUnit &&oldUnit._currentElement;//获取老元素
      if(shouldDeepCompare(oldElement,newElement)){
        // 递归比较dom oldUnit就是最新的unit
        oldUnit.update(newElement)
        newChildrenUnits.push(oldUnit)
        newChildrenUnitMap[newKey] = oldUnit
      }else{
        // 如果共同的key 找到的类型不一样 就创建新的unit 
        let nextUnit = createUnit(newElement)
        newChildrenUnits.push(nextUnit);
        newChildrenUnitMap[newKey] = nextUnit
      }
    })
    return {newChildrenUnitMap,newChildrenUnits};
  }
  getOldChildrenMap(childrenUnits=[]){
    let map = {}
    for(let i=0;i<childrenUnits.length;i++){
      let unit = childrenUnits[i];
      let key = (unit._currentElement.props && unit._currentElement.props.key)|| i.toString()
      map[key] = unit
    }
    return map
  }
  updateDOMProperties(oldProps,newProps){
    let propName;
    //循环老的属性集合
    for(propName in oldProps){
      // 新的属性里面没有
      if(!newProps.hasOwnProperty(propName)){
        $(`[data-reactid="${this._reactid}"]`).removeAttr(propName)
      }
      if(/^on[A-Z]/.test(propName)){
        $(document).undelegate(`.${this._reactid}`)
      }
    }
    for(propName in newProps){
      if(propName === 'children'){//如果是儿子属性 先不处理
        continue;
      }else if(/on[A-Z]/.test(propName)){
        // 事件处理
        let eventName = propName.slice(2).toLocaleLowerCase();
        $(document).delegate(`[data-reactid="${this._reactid}"]`, `${eventName}.${this._reactid}`, newProps[propName])
      }else if(propName === 'className'){
        // $(`[data-reactid="${this._reactid}"]`)[0].className = newProps[propName]
        $(`[data-reactid]="${this._reactid}"`).attr('class',newProps[propName])
      }else if(propName === 'style'){
        let styleObj = newProps[propName];
        Object.entries(styleObj).map(([attr, value]) => {
          $(`[data-reactid="${this._reactid}"]`).css(attr,value);
        })
      }else{
        // 上面是特殊属性  这里是修改普通的属性
        $(`[data-reactid="${this._reactid}"]`).prop(propName,newProps[propName])
      }
    }
  }
}
class CompositeUnit extends Unit {
  // 这里负责处理组件的更新操作
  update(nextElement,partialState){
    // 先获取到新元素
    this._currentElement = nextElement
    // 获取新的状态,不管要不要更新组件,组件的状态一定要修改
    // 前面操作的setState 在这个地方进行了处理 下面调用render的时候 就是最新的state
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
      // preRenderedUnitInstance 这是老的unit
      preRenderedUnitInstance.update(nextRenderElement)
      // 更新完成
      this._componentInstance.componentDidUpdate&&this._componentInstance.componentDidUpdate()
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
    // 在这个时候绑定一个事件 等待挂载完成后出发 mounted事件 
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