const crypto = require('crypto');// 加密模块
'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据

    // 链接数据库
    // 链接 / 操作数据库
    // 有不懂, 看这个 http://blog.csdn.net/zxsrendong/article/details/17006185
    that.connect(( err , db , conn ) => {
        // 生成随机的单号
        // 更新数据
        db.query("select * from `db_order` where order_no = ?", body.order_no, function(err, row, fields) {
            // 数据获取失败
            if (err) {
                return res.errorEnd('没有找到可用数据', 200);
            }
            if(row.length = 0 ){
                return res.errorEnd('没有找到可用订单', 200);
            }
            var data = new Date();
            var time = data.getTime();
            var md5=crypto.createHash("md5"); 
            var key = 'JHKJ'+body.order_no + time +"999";

            md5.update(key); 
            var sign = md5.digest('hex');
            var md51=crypto.createHash("md5");

            var key1 = 'JHKJ'+sign+time+"666";
            md51.update(key1); 
            var sign1 = md51.digest('hex');
            var data = {'key' : sign1,'time' : time ,'row' : row[0]};

            db.release(); // 释放资源
            conn.end();
           
            if(row){
                return res.successEnd(data);
            }
            // 操作失败 返回失败信息, 同时设置 http 状态码为 200
            return res.errorEnd( '没有找到数据' , 200 );
        })
    });
}