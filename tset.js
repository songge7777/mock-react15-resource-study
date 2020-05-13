/*
  1、 封装sleep函数 睡眠一段时间
  2、
    function Foo() {
    getName = function () { alert (1); };
    return this;
    }
    Foo.getName = function () { alert (2);};
    Foo.prototype.getName = function () { alert (3);};
    var getName = function () { alert (4);};
    function getName() { alert (5);}
    //答案：
    Foo.getName();
    getName();
    Foo().getName();
    getName();
    new Foo.getName();
    new Foo().getName();
    new new Foo().getName();
  3、
    {}+{}
    []+{}
    {}+[]
    []+[]
  4、实现一个函数,数组数据打乱
    fn([1, 2, 3, 4, 5, 6])


    console.log('1')
    sleep(1000)
    console.log('2')



    */