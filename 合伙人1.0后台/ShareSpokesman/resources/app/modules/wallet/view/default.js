
const request = require('request');
const moment = require('moment');
const crypto = require('crypto');

'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据
    that.connect(( err , db , conn ) => {


            if(req.session.user_rows = null){
                return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
            }
            if(req.session.user_token != body.token){
                return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
            }
            if(  that.isEmpty(body.id) ){
                return res.errorEnd('个人不能为空', 200);
            }






            db.query(" SELECT a.amount ,a.cash ,a.expect_amount ,b.* from  `db_people` a left join db_activity_log b on a.id=b.user_id where    a.id=? ",[body.id], function(err, people, fields) {
                // 数据获取失败
                if (err) {
                    return res.errorEnd('没有找到可用数据', 200);
                }
                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接
                return res.successEnd(people);

            });




















    });
}
