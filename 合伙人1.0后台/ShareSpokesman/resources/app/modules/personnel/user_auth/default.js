// Node 内置模块
// const fs = require('fs'); // 文件操作模块
// const url = require('url'); // 链接处理模块
// const path = require('path'); // 路径处理模块
// const http = require('http'); // 网页请求模块
const crypto = require('crypto');// 加密模块
// const child_process = require('child_process');// 进程通信模块
// 第三方模块
// const ftp = require('ftp');// FTP模块
// const moment = require('moment'); // 时间处理插件
// const session = require('session');

'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据+
    // app.user(session({
    //     secret: 'hubwiz app', //secret的值建议使用随机字符串
    //     cookie: {maxAge: 60 * 1000 * 30} // 过期时间（毫秒）
    // }));
    // that 里面有什么可以调用的 你可以看 resources\app\lib\core.js 文件!
    // 例如 that.isEmpty(123) // 判断传入的值, 是否是空 具体看方法说明!!!

    // 链接数据库
    // 链接 / 操作数据库
    if(body){
        that.connect((err, db,conn) => {
            db.query("select * from `db_people` where openid = ? ",body.openid, function(err, row, fields) {
                // 数据获取失败
                if (err) {
                    return res.errorEnd('没有找到可用数据', 200);
                }
                //查询是否第一次登录这个系统 如果第一次就添加数据 如果不是第一次就
                if(row.length > 0){
                    return 1;

                    var md5=crypto.createHash("md5"); 
                    var key = "QWEASDZXC19960408";
                    md5.update(key); 
                    var sign = md5.digest('hex');
                    var data = new Date();
                    var time = data.getTime();
                    var token = "JHKJ" +sign + time;



                }else{
                    var data = {
                        openid : body.openid,
                        nickname: body.nickname,
                        createtime : body.create_time,
                    }
                    db.query( "INSERT INTO db_people set ?" , data , function( err1, result1  ){
                        if( err1 ){
                            // 数据插入失败, 回滚
                            db.rollback();
                            db.release();// 释放资源
                            return res.errorEnd('创建数据失败!!', 200);
                        }
                        var md5=crypto.createHash("md5"); 
                        var key = "QWEASDZXC19960408";
                        md5.update(key); 
                        var sign = md5.digest('hex');
                        var data = new Date();
                        var time = data.getTime();
                        var token = "JHKJ" +sign + time;

                    });
                }

                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接

                // 操作正确 返回取出的数据
                return res.successEnd(row);

                // 操作失败 返回失败信息, 同时设置 http 状态码为 200
                // return res.errorEnd( '没有找到数据' , 200 );
            })
        });
    }



}