/**
 * Created by Administrator on 2017/8/16.
 * 所有活动的获取 视图
 */
const moment = require('moment');

'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据

    // 查询数据
    if(req.session.user_rows = null){
        return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
    }
    if(req.session.user_token != body.token){
        return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
    }     
    if(  that.isEmpty(body.manager_id) ){
        return res.errorEnd('老板不能为空', 200);
    }
    if(  that.isEmpty(body.shopowner_id) ){
        return res.errorEnd('店长不能为空', 200);
    }

    that.connect(( err , db , conn ) => {


        var data = {


                    manager_id:body.manager_id,
                    shopowner_id:body.shopowner_id,
                    notice_type:body.notice_type,
                    detailed :body.detailed,
                    headline:body.headline,
                    create_time:new Date().getTime()/1000


             
 
                }; 

      

        db.query(" insert into db_notice_shopowner  set ?   ",data, function(err, row, fields) {
            // 数据获取失败
            if (err) {
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('没有找到可用数据',this.sql, 200);
            }
            db.commit();
            db.release(); // 释放资源
            conn.end(); // 结束当前数据库链接
            return res.successEnd('代言人端公告添加成功', 0);
       
        })
    
    });
}
