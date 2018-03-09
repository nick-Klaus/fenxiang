/**
 * Created by Administrator on 2017/8/11.
 * 上传图片接口 上传到 app/images
 * req.sideUrl 当前域名 http://www.zsb2b.com:8081/
 */
const fs = require('fs');
'use strict';
exports.ready = (req, res, that) => {
    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据
    that.connect(( err , db , conn ) => {
        var d = new Date();
        var str_day = d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();
        var base64Str = body.data;
        var base64Data = base64Str.match(/^data:([a-zA-Z]+)\/([a-zA-Z]+);base64,(.*?)$/);// 匹配多条正则
        if(base64Data.length === 4){
            // 获取保存图片路径
            var path_img = that.mkDirs(__dirname.split("modules")[0]+"images/"+str_day,"0777","");
            var img_name =Math.ceil( d.getTime()/1000 )+"."+base64Data[2];
            var file = path_img+"/"+img_name;
            var dataBuffer  = new Buffer(base64Data[3], 'base64');
            fs.writeFile( file, dataBuffer,function(err) {
                if(err){
                    return res.errorEnd("图片上传失败",200);
                }else{
                    return res.successEnd(req.sideUrl+"static/"+str_day+"/"+img_name);
                }
            });
        }else{
            return res.errorEnd("图片格式错误",200);
        }
    });
}