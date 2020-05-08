class A {
  constructor(){
    // this.a = this.a()
  }
  a(){
    return 'aa'
  }
}

let a = new A()
// A.prototype.a = '.........'
// A.prototype.a = function (){
//   return '1111'
// }
console.log(A.prototype.a)