/**
 * Created by Administrator on 2017/8/16.
 * 所有活动的获取 视图
 */
 const crypto = require('crypto');

'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据
 
    if(  that.isEmpty(body.id) ){
        return res.errorEnd('ID不能为空', 200);
    }
       if(  that.isEmpty(body.pid) ){
        return res.errorEnd('审批人ID不能为空', 200);
    }
    var is_extend =0;
    var extend_time=0;
    //是否推广
    if(  !that.isEmpty(body.is_extend) ){
        is_extend=body.is_extend;
        if(body.is_extend==1){
            if( !that.isEmpty(body.extend_time) ){
                extend_time=body.extend_time;
            }        
        }
       
    }
    that.connect(( err , db , conn ) => {
        db.beginTransaction(function(err){

            //生成老板记录 
                db.query("update  db_manager_apply set  status=1  ,approve_time=unix_timestamp(now()),extend_time=?, approve_id=? ,apply_remark=? where id=? and  status=0 ",[extend_time,body.pid,body.apply_remark,body.id], function(err, manager_apply, fields) {
                    // 数据获取失败
                    if (err) {
                        
                        db.rollback();
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('更新审批失败', 200);
                    }
                    db.commit();
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                               
                    return res.successEnd("审批通过！", 0);

                }); 

        });
    
    
    });
}
