/**
 * Created by Administrator on 2017/8/16.
 * 所有活动的获取 视图
 */
'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据
    that.connect(( err , db , conn ) => {
        // 查询数据
         if(req.session.user_rows = null){
             return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
         }
        if(req.session.user_token != body.token){
             return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
        }
        
        if(  that.isEmpty(body.id) ){
            return res.errorEnd('id不能为空', 200);
        }
        if(  that.isEmpty(body.status) ){
            return res.errorEnd('状态不能为空', 200);
        }

         db.query(" UPDATE db_policy SET STATUS =? WHERE ID =? ; ",[body.status,body.id], function(err, row, fields) {
                        // 数据获取失败
                        if (err) {
                            return res.errorEnd('没有找到可用数据', 200);
                        }
                        db.commit();
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.successEnd('更新成功', 0);
        })
    
    });
}
