/**
 * Created by Administrator on 2017/8/11.
 * 创建签到规则 先判断是否创建
 */
'use strict';
exports.ready = (req, res, that) => {
    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据

    that.connect(( err , db , conn ) => {
        db.beginTransaction(function(err){
            // 事物创建失败  管理员id不能为空
            if (err || that.isEmpty(body.manager_id)) {
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('没有找到可用数据', 200);
            }
            var select_arr = [body['manager_id']];// 查询条件
            db.query("select * from `db_people_day_rule` where manager_id=? ",select_arr,function(err, row, fields) {
                // 数据获取失败
                if (err) {
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('没有找到可用数据', 200);
                }
                // 已经存在签到数据则不能重新创建
                if ( row.length == 0  ) {
                    // 插入数据
                    db.query( "INSERT INTO `db_people_day_rule` SET ?" , body , function( err, result , fields ){
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
                }else{
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('该用户已创建签到规则！', 200);
                }
            })
        });
    });
}