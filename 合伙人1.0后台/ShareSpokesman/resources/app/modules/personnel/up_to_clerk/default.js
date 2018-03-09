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


    if(  that.isEmpty(body.pid) ){
        return res.errorEnd('个人不能为空', 200);
    }

    that.connect(( err , db , conn ) => {
        db.beginTransaction(function(err){



            if(body.is_clerk=='1'){
                db.query(" update db_people set is_clerk='1' where id=? ",[body.pid], function(err, result1, fields) {
                    // 数据获取失败
                    if (err) {
                        db.rollback();
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('修改个人信息失败', 200);
                    }
                    db.commit();
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.successEnd('升级为店员成功！', 0);

                })
            }else{
                db.query(" update db_people set is_clerk='0' where id=? ",[body.pid], function(err, result1, fields) {
                    // 数据获取失败
                    if (err) {
                        db.rollback();
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('修改个人信息失败', 200);
                    }
                    db.commit();
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.successEnd('撤销为店员成功！', 0);

                })
            }


             
        });
    
    
    });
}
