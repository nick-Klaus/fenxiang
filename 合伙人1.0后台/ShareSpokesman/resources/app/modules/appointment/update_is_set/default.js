/**
 * Created by Administrator on 2017/8/16.
 * 所有活动的获取 视图
 */
'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据
    if(req.session.user_rows = null){
        return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
    }
    if(req.session.user_token != body.token){
        return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
    }


    if(that.isEmpty(body.id) ){
        return res.errorEnd('ID不能为空', 200);
    }
    if(that.isEmpty(body.pid) ){
        return res.errorEnd('接待店员不能为空', 200);
    }

    that.connect(( err , db , conn ) => {
        db.beginTransaction(function(err){



                db.query(" update db_appointment set is_set=2 ,to_clerk_id=?,to_clerk_name=?,set_time=unix_timestamp(now()) where id=? ",[body.pid,body.clerk_name,body.id], function(err, result1, fields) {
                    // 数据获取失败
                    if (err) {
                        db.rollback();
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('指派失败', 200);
                    }
                    db.commit();
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.successEnd('指派成功！', 0);

                })
           


             
        });
    
    
    });
}
