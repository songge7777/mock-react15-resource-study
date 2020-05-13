/*
  1、从顶点开始遍历
  2、如果有儿子,先遍历大儿子
*/

// 在浏览器执行

let A1 = {type:'div',key:'A1'}
let B1 = {type:'div',key:'B1',return:A1};
let B2 = {type:'div',key:'B2',return:A1};
let C1 = {type:'div',key:'C1',return:B1};
let C2 = {type:'div',key:'C2',return:B1};
A1.child = B1;
B1.sibling = B2;
B1.child = C1;
C1.sibling = C2;

function sleep(d){
  for(var t = Date.now();Date.now() - t <= d;){}
}

let nextUnitOfWork = null;// 下一个执行单元
function workLoop(deadLine){
  // while(nextUnitOfWork){// 如果有带执行的执行单元 就执行 然后会返回下一个执行单元
  //   nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
  // }
  while((deadLine.timeRemaining() > 1 || deadLine.didTimeout) && nextUnitOfWork){
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
  }
  if(!nextUnitOfWork){
    console.log('render阶段执行结束')
  }else{
    console.log('123')
    requestIdleCallback(workLoop,{timeout:1000})
  }
}
// 开始遍历
function performUnitOfWork(fiber){
  beginWork(fiber)//处理fiber
  if(fiber.child){// 如果有儿子 返回大儿子
    return fiber.child
  }
  // 如果没有儿子 说明此fiber已经完成了
  while(fiber){
    completeUnitOfWork(fiber)
    if(fiber.sibling){
      return fiber.sibling//如果有弟弟就返回 亲弟弟
    }
    // 在找父亲的弟弟
    fiber = fiber.return
  }
}
function completeUnitOfWork(fiber){
  console.log('结束',fiber.key)
}
function beginWork(fiber){
  sleep(20)
  console.log('开始',fiber.key)
}

nextUnitOfWork = A1
// workLoop
requestIdleCallback(workLoop,{timeout:1000})
