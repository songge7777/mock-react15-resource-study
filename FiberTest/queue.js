

class Update{
  constructor(payload,nextUpdate){
    this.payload = payload
    this.nextUpdate = nextUpdate
  }  
}


class UpdateQueue{
  constructor(){
    this.baseState = null
    this.firstUpdate = null
    this.lastUpdate = null
  }
  enqueueUpdate(update){
    if(this.firstUpdate == null){
      this.firstUpdate = this.lastUpdate = update
    }else{
      this.lastUpdate.nextUpdate = update
      this.lastUpdate = update
    }
  }
  forceUpdate(){
      let currentState = this.baseState || {}
      let currentUpdate = this.firstUpdate
      while(currentUpdate){
        let nextState = typeof currentUpdate.payload == 'function' ? currentUpdate.payload(currentState) : currentUpdate.payload
        currentState = {...currentState,...nextState}
        currentUpdate = currentUpdate.nextUpdate
      }
      this.firstUpdate = this.lastUpdate = null;
      this.baseState = currentState
      return currentState
  }
}


let queue = new UpdateQueue();
queue.enqueueUpdate(new Update({name:'sg'}))
queue.enqueueUpdate(new Update({age:12}))
queue.enqueueUpdate(new Update((data)=>({age:data.age+1})))
queue.enqueueUpdate(new Update((data)=>({age:data.age+2})))
console.log(queue.forceUpdate()) ;
console.log(queue.baseState)
