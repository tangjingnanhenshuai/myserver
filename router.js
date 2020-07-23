exports.readFileBySuffixName = function(pathname,fs,request,response){
  var ext = pathname.match(/(\.[^.]+|)$/)[0];
  switch(ext){
    case ".css":
    case ".js":
       fs.readFile("."+request.url,"utf-8",function(err,data){
          if(err) console.log("读取js/css失败！")
          response.writeHead(200,{
            "Content-Type":{
              ".css":"text/css",
              ".js":"application/javascript"
            }[ext]
          });
           response.write(data);
           response.end();
       });
       break;
    case ".jpg":
    case ".gif": 
    case ".png": 
       fs.readFile("."+decodeURI(request.url),"binary",function(err,data){
           if(err) {
             console.log("读取图片失败") 
           } else{
            response.writeHead(200,{
              "Content-Type":{
                  ".jpg":"image/jpeg",
                  ".gif":"image/gif",
                  ".png":"image/png",
              }[ext]
          });
          response.write(data,'binary'); //发送二进制数据
          response.end();
           }
       });
       break;
    case ".mp4":
         //读取文件的状态
         fs.stat('.'+decodeURI(request.url),function(err,stats){
          if(err){
              if(err.code === 'ENOENT'){
                  return response.sendStatus(404);
              }
              response.end(err);
          }
          //断点续传，获取分段的位置
          var range = request.headers.range;
          if(!range){
              //206状态码表示客户端通过发送范围请求头Range抓取到了资源的部分数据
              //416状态码表示所请求的范围无法满足
              return response.sendStatus(416);
          }
          //替换、切分，请求范围格式为：Content-Range: bytes 0-2000/4932
          var positions = range.replace(/bytes=/,"").split("-");
          //获取客户端请求文件的开始位置
          var start = parseInt(positions[0]);
          //获得文件大小
          var total = stats.size;
          //获取客户端请求文件的结束位置
          var end = positions[1] ? parseInt(positions[1],10):total -1;
          //获取需要读取的文件大小
          var chunksize = (end-start) + 1;

          response.writeHead(206,{
              "Content-Range":"bytes "+ start+"-"+end+"/"+total,
              "Accept-Ranges":"bytes",
              "Content-Length":chunksize,
              "Content-Type":"video/mp4"
          });
          //创建读取流
          var stream = fs.createReadStream('.'+decodeURI(request.url),{start:start,end:end})
          　　.on("open",function(){
              stream.pipe(response); //读取流向写入流传递数据
          }).on("error",function(err){
              response.end(err);
          });
      });
      break;
    case ".mp4": 
        fs.stat("."+decodeURI(request.url),function(err,stats){
          if(err){
            if(err.code==="ENOENT"){
              return response.sendStatus(404);
            }
            response.end(err);
          }
   
            var total = stats.size;

           console.log("大小",total)
          let start=0
          let end=10000000
            var chunksize = (end-start) + 1;
       
            let head = { 'Content-Type': 'video/mp4' };
            //需要设置HTTP HEAD
            response.writeHead(200, head);
            //使用pipe
          //  var liu = fs.createReadStream('./video/test.mp4',{start:0,end:16761753});
           var liu = fs.createReadStream('./video/test.mp4');
           liu.on('open',(res)=>{
            liu.pipe(response);
           })
      
         
        })
        break;
        　case ".rar":
          //同步读取文件状态
          　　var stats = fs.statSync("." + decodeURI(request.url));
                response.writeHead(200,{
                    "Content-Type": "application/octet-stream", //相应该文件应该下载
                    //模板字符串
                    "Content-Disposition": `attachment; filename = ${pathname.replace("/","")}`,
                    "Content-Length":stats.size
                });
             //管道流
             fs.createReadStream("." + decodeURI(request.url)).pipe(response);
             break;
　　　　　　　　//以上都不匹配则使用默认的方法
　　　　　　default:
 　　　　　　　fs.readFile('.'+pathname,'utf-8',function(err,data){    
                response.writeHead(200,{
                    "Content-Type":"text/html"
                });
                response.write(data);
                response.end();
            });
  }
}