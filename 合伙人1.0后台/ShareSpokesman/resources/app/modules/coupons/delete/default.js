/**
 * 2017年9月29日 09:48:50 优化
 */
'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body || {}; // 当前请求传递过来的 POST 数据
    const USER = req.session.user_rows || {};

    if( !USER.id ){
        return res.errorEnd('请求错误, Token 验证失败!!', 300);
    }
    if( !USER.is_manager && !USER.is_shopowner ){
        return res.errorEnd('卡券删除失败, 您的权限不足', 200);
    }
    if( !body.coupons_id ){
        return res.errorEnd('没有找到相关卡券', 200);
    }
    // 链接数据库
    // 链接 / 操作数据库
    that.connect(( err , db , conn ) => {
        db.query("UPDATE ?? SET ? WHERE `id`= ? AND `manager_id` = ? AND `issued_total` = 0 AND `use_total` = 0 AND `status` <> 999 LIMIT 1", [ 'db_coupons' , { status: 999 } , body.coupons_id , USER.manager_id ] , function(err, row, fields) {
            if( err || !row.affectedRows ){
                endQuery(); // 结束当前数据库链接
                return res.errorEnd('卡券删除失败!', 200);
            }
            endQuery(); // 结束当前数据库链接
            return res.successEnd( 'success' );
        });
        function endQuery(){
            db.release();// 释放资源
            conn.end(); // 结束当前数据库链接
        }
    });
}