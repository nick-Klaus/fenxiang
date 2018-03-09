/**
 * Created by Administrator on 2017/8/16.
 * 所有活动的获取 视图
 */
'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据
    // 查询数据
 
    if(  that.isEmpty(body.pid) ){
        return res.errorEnd('个人不能为空', 200);
    } 
    that.connect(( err , db , conn ) => {

   

         db.query(" update  `db_noticet_record` set status = 999 , delete_date=unix_timestamp(now()) where     pid =? ",[body.pid], function(err, row, fields) {
            // 数据获取失败
            if (err) {
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('没有找到可用数据', 200);
            }
            db.commit();
            db.release(); // 释放资源
            conn.end(); // 结束当前数据库链接
            return res.successEnd('删除成功', 0);
       
        })
    
    });
}
