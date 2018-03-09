/**
 * 2017年10月9日 09:14:57 优化
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
    // 链接数据库
    // 链接 / 操作数据库
    that.connect(( err , db , conn ) => {
        let search = '';
        if( /^\d+$/.test(body.user_id) ){
            search += "AND ( a.user_id = "+ (body.user_id|0) +" )";// 指定用户的卡券
        }
        if( /^\d+$/.test(body.types) ){
            search += "AND ( b.types = "+ (body.types|0) +" )";// 指定类型的卡券
        }
        if( body.openid ){
            search += "AND ( a.openid = "+ (body.openid) +" )";// 指定用户的卡券
        }
        if( /^\d+$/.test(body.used_clerk_id) ){
            search += "AND ( a.used_clerk_id = "+ (body.used_clerk_id|0) +" )";// 已核销卡券
        }
        let condition = ( body.condition || '' ).toLowerCase();
        if( /[a-zA-Z]/.test(condition) ){
            search += 'AND (';
            if( condition == 'a' ){
                search += ' a.used_date IS NOT NULL';// 已核销
            }else if( condition == 'b' ){
                search += ' a.used_date IS NULL';// 未核销
            }else{
                search += ' 1';// 未核销
            }
            search += ' )';
        }
        let sql = "SELECT count(*) AS total FROM `db_coupons_record` AS a, `db_coupons` AS b WHERE b.id = a.coupons_id AND a.manager_id = ? "+ search +" LIMIT 1 ";
        db.query( sql , [ USER.manager_id ] , function(err, row, fields) {
            const total  = typeof row === 'object' && typeof row[0] === 'object' ? ( row[0].total | 0 ) : 0;
            const result = {"totalrecord": total,"totalpage": 0,"pagesize": ( body.pagesize | 0) || 10 ,"currentpage": ( body.currentpage | 0), list: [] };
            result.totalpage = Math.ceil( total / result.pagesize );
            if( total < 1 ){
                endQuery(); // 结束当前数据库链接
                return res.successEnd( result );
            }
            let sql  = "SELECT a.*,b.start_time AS start_time,b.end_time AS end_time, b.headline, b.types, b.worth, b.content, b.backdrop, b.status AS coupons_status FROM ";
                sql += "`db_coupons_record` AS a, `db_coupons` AS b ";
                sql += "WHERE b.id = a.coupons_id AND a.manager_id = ? "+ search +" LIMIT ?, ? ";
            db.query( sql , [ USER.manager_id , result.currentpage , result.pagesize ] , function(err, list, fields) {
                endQuery(); // 结束当前数据库链接
                result.list = list || [];
                return res.successEnd( result );
            });
        });
        function endQuery(){
            db.release();// 释放资源
            conn.end(); // 结束当前数据库链接
        }
    });

}