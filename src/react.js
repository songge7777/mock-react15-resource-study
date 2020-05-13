import { ELEMENT_TEXT } from './constants'
/**
 * 创建元素(虚拟DOM)的用法
 * @param {*} type 元素的类型div span p 
 * @param {*} config 配置对象 属性 key ref
 * @param  {...any} children 放着所有的儿子,这里会做成一个数组
 */ 
function createElement(type, config, ...children){
  delete config._self;
  delete config._source;// 表示这个元素是在哪行哪列哪个文件生成的
  return {
    type,
    props:{
      ...config,// 做了一个兼容处理, 如果是React元素的话返回自己，如果是文本类型和字符串的话，返回元素对象
      children:children.map(child=>{
        return typeof child === 'object'?child:{
          type:ELEMENT_TEXT,
          props:{text:child,children:[]}
        }
      })
    }
  }
}
const React = {
  createElement
}
export default React