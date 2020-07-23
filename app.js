var http = require('http');
var fs = require('fs');
var url = require('url');

var router = require('./router.js');
function get_client_ipv4(req) {
  //获取任意浏览器的IP地址，
  var ip = req.headers['x-forwarded-for'] ||
      req.ip ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress || '';
  //获取到的IP地址中存在IPV4和IPV6的地址，我们只需要IPV4的地址
  // if(ip.split(',').length>0){
  //     ip = (ip.split(',')[0]).match(/(\d+\.\d+\.\d+\.\d+)/)[0];
  // }
  return ip;
};
function showLog(ipv4,message){
  //获取当前时间
  var date = new Date();
  //转换为本地时间的字符串形式并输入到控制台
  console.log(date.toLocaleDateString() + " " + date.toLocaleTimeString() +
      " " + ipv4 + " " + message);
}

http.createServer(function(request,response){
   var pathname= url.parse(request.url).pathname;
  console.log("aaaaaaaaaaaaaaaaaaaaaaaaaa",pathname)

   if(pathname=="/"){
     pathname="/index.html";
   }
   var ipv4=get_client_ipv4(request)
  //  showLog(ipv4,("请求"+decodeURI(pathname)));
   console.log("decodeURI",decodeURI(pathname))
   fs.exists(__dirname + decodeURI(pathname),function(exists){
    if(exists){
        //使用router模块的函数
        router.readFileBySuffixName(pathname,fs,request,response);
    }else{
        // console.log(decodeURI(pathname)+"文件不存在！");
        //文件不存在，向客户端发送404状态码，并发送该文件不存在的字符串
        response.writeHead(404,{"Content-Type":"text/plain"});
        response.end(pathname+"文件不存在！");
    }
});
  //  console.log(ipv4)
}).listen(3000)
