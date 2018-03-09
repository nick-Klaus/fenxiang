/**
 * Created by Administrator on 2017/8/11.
 * 代言人升级记录 创建
 */
'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据

    that.connect(( err , db , conn ) => {
        db.beginTransaction(function(err){
            // 事物创建失败
            if (err) {
                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('没有找到可用数据', 200);
            }
            // 升级记录 是否已经存在
            var select_arr = [body['manager_id'],body['user_id'],body['taskcount']];// 查询条件
            db.query("select * from `db_people_level_up` where manager_id=? and user_id=? and taskcount=?",select_arr , function(err, row, fields) {
                // 数据获取失败
                if (err) {
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('没有找到可用数据', 200);
                }
                // 插入数据
                if( row.length ){
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.successEnd(row);// 升级记录已经存在
                }else{
                    db.query( "INSERT INTO `db_people_level_up` SET ? " , body, function( err, result , fields ){
                        if( err ){
                            // 数据插入失败, 回滚
                            db.rollback();
                            db.release();// 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd('创建数据失败!!', 200);
                        }
                        db.commit();
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.successEnd("创建数据成功" + result.insertId );
                    });
                }
            })
        });
    });
}