// Node 内置模块
// const fs = require('fs'); // 文件操作模块
// const url = require('url'); // 链接处理模块
// const path = require('path'); // 路径处理模块
// const http = require('http'); // 网页请求模块
// const crypto = require('crypto');// 加密模块
// const child_process = require('child_process');// 进程通信模块
// 第三方模块
// const ftp = require('ftp');// FTP模块
// const moment = require('moment'); // 时间处理插件
const crypto = require('crypto');
'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据

    // that 里面有什么可以调用的 你可以看 resources\app\lib\core.js 文件!
    // 例如 that.isEmpty(123) // 判断传入的值, 是否是空 具体看方法说明!!!

    // 链接数据库
    // 链接 / 操作数据库

    
    if(that.isEmpty(body.accountno) ){
        return res.errorEnd('账号不能为空', 200);
    }
    if(that.isEmpty(body.password) ){
        return res.errorEnd('密码不能为空', 200);
    }

    that.connect((err, db,conn) => {

        var id = body.accountno.toUpperCase().replace("HHR000","");
        console.log(id);
                
        db.query("select  b.*,a.password shop_password,a.password_hash shop_password_hash from db_shopowner a left join db_people b  on a.manager_id=b.manager_id and a.openid=b.openid where a.id=? ", [id]  , function(err, row, fields) {
        // 数据获取失败
            if (err) {
                return res.errorEnd('账户名或密码错误', 200);
            }

            var shop_password = row[0].shop_password;
            var shop_password_hash = row[0].shop_password_hash;
            row[0].shop_password="";
            row[0].shop_password_hash="";
            row[0].openid_jhkj=""; 
            var sign = crypto.createHash('md5').update( body.password.toUpperCase()+shop_password_hash ).digest('hex');
            db.release(); // 释放资源
            conn.end(); // 结束当前数据库链接    
            if(sign==shop_password){
                row[0].password="";
                row[0].password_hash="";
                return res.successEnd(row);
            }else{
                return res.errorEnd('账户名或密码错误', 200);
            }
   
            
            
        });
            
        
    });


}