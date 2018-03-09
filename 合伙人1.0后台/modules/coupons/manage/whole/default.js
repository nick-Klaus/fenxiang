/**
 * 2017年9月29日 09:47:51 优化
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
    // if( !USER.is_manager ){
    //     return res.errorEnd('操作失败, 您的权限不足', 200);
    // }
    // 链接数据库
    // 链接 / 操作数据库
    that.connect(( err , db , conn ) => {
        let search = /^\d+$/.test(body.coupons_id) && body.coupons_id > 0 ? "AND a.id = " + body.coupons_id + " " : "";
        let condition = ( body.condition || '' ).toLowerCase();
        if( /[a-zA-Z]/.test(condition) ){
            search += 'AND (';
            if( condition == 'a' ){
                search += ' a.end_time < now()';// 已过期
            }else if( condition == 'b' ){
                search += ' a.start_time > now()';// 未生效
            }else if( condition == 'c' ){
                search += ' 1';// 所有状态
            }else if( condition == 'd' ){
                search += ' a.end_time > now()';// 未过期
            }else{
                search += ' a.end_time > now() AND a.start_time < now()';// 在生效中的卡券
            }
            search += ' )';
        }else{
            search += 'AND ( a.end_time > now() AND a.start_time < now() )';// 在生效中的卡券
        }
        if( /\d+/.test(body.types) ){
            search += 'AND ( a.types = '+ ( body.types | 0) +' )';
        }
        if( /\d+/.test(body.status) ){
            search += 'AND ( a.status = '+ ( body.status | 0) +' )';
        }else{
            search += 'AND ( a.status <> 999 )';
        }
        let sql  = "SELECT count(*) AS total FROM `db_coupons` AS a, `db_coupons_access` AS b WHERE ( b.coupons_id = a.id AND b.manager_id = ? "+ search +" ) group by a.id LIMIT 1 ";
        db.query( sql , [ USER.manager_id ] , function(err, row, fields) {
            const total  = typeof row === 'object' && typeof row[0] === 'object' ? ( row[0].total | 0 ) : 0;
            const result = {"totalrecord": total,"totalpage": 0,"pagesize": ( body.pagesize | 0) || 10 ,"currentpage": ( body.currentpage | 0), list: [] };
            result.totalpage = Math.ceil( total / result.pagesize );
            if( total < 1 ){
                endQuery(); // 结束当前数据库链接
                return res.successEnd( result );
            }
            let sql  = "SELECT a.*, b.shopowner_id AS access_shopowner_id, b.id AS access_id FROM `db_coupons` AS a, `db_coupons_access` AS b WHERE ( b.coupons_id = a.id AND b.manager_id = ? "+ search +" ) group by a.id order by a.id desc LIMIT ?, ? ";
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