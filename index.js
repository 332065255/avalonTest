var avalon = require("avalon2")
require("mmRouter")
let vm = avalon.define({
    $id: "app",
    age: 18,
    html: "<h1>hello world</h1>",
    showLog: function() {
        vm.age += 10;
        console.log("this is log");

    }
});
// console.log(avalon, avalon.router, avalon.router.add)
avalon.router.add("/aaa", function(a) {
    vm.currPath = this.path
        // this里面能拿到如下东西:
        // path: 路径
        // query: 一个对象，就是？后面的东西转换成的对象
        // params: 一个对象， 我们在定义路由规则时，那些以冒号开始的参数组成的对象
});
avalon.router.add("/tab1", function() {
    // vm.html = require("./js/tab1/tab1.html");
    vm.html = require("./js/tab1/tab1");
});
avalon.router.add("/tab2", function() {
    vm.html = "<h1>tab2</h1>"
});
avalon.router.add("/tab3", function() {
    vm.html = "<h1>tab3</h1>"
});
//启动路由监听
avalon.history.start({
    root: "/avalonTest/"
});
// debugger;/
avalon.scan();