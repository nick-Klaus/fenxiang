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
    if(  that.isEmpty(body.notice_id) ){
        return res.errorEnd('公告id不能为空', 200);
    }

    that.connect(( err , db , conn ) => {


         db.query("SELECT * from  `db_noticet_record` where    notice_id=? and pid =? ",[body.notice_id,body.pid], function(err, row, fields) {
            // 数据获取失败
            if (err) {
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('没有找到可用数据', 200);
            }

            if(row.length>0){
                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接

                return res.successEnd('查看成功', 0);
            }else{
                //为空新建查看记录
                    db.query(" INSERT INTO db_noticet_record ( notice_id, view_date, delete_date, status,  pid) VALUES (?, unix_timestamp(now()),null,1, ?); ",[body.notice_id,body.pid], function(err, row, fields) {
                        // 数据获取失败
                        if (err) {
                            db.release();// 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd('没有找到可用数据', 200);
                        }
                        db.commit();
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.successEnd('查看成功', 0);
                    })
            }
       
        })
    
    });
}
