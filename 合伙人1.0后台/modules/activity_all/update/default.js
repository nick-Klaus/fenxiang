/**
 * Created by Administrator on 2017/8/9.
 *  活动的开启和关闭
 */
'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据

    that.connect(( err , db , conn ) => {

        if( that.isEmpty(body.id) || that.isEmpty(body.table_name) ){
            db.release();// 释放资源
            conn.end(); // 结束当前数据库链接
            return res.errorEnd('条件不能为空', 200);
        }
        // 更新数据
        if( !that.isEmpty(body.open_off) ){
            var update_arr = {"open_off":body.open_off}
        }
        if( !that.isEmpty(body.status) ){
            var update_arr = {"status":body.status}
        }
        db.query( "UPDATE ?? SET ? where id=? and boss_id=?" , [ body.table_name,update_arr ,body.id,body.boss_id] , function( err, result , fields ){
            var total = result.changedRows ; // 受影响的数据条数, ( 已删除的数据条数 )
            if( err ){
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('更新数据失败!!', 200);
            }
            if( !total ){
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('没有找到可操作的数据!!', 200);
            }
            db.release(); // 释放资源
            conn.end(); // 结束当前数据库链接
            return res.successEnd( '成功更新数据 : '+ total );
        });
    });
}
