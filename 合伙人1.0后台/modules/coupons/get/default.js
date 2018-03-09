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
    // 链接数据库
    // 链接 / 操作数据库
    that.connect(( err , db , conn ) => {
        let sql  = "SELECT a.*, b.shopowner_id AS access_shopowner_id, b.id AS access_id FROM `db_coupons` AS a, `db_coupons_access` AS b WHERE ( b.coupons_id = a.id AND a.status <> 999 AND b.manager_id = ? AND a.id = ? ) LIMIT 1 ";
        db.query( sql , [ USER.manager_id , body.coupons_id ] , function(err, row, fields) {
            if( err || !row || !row.length ){
                endQuery();
                return res.errorEnd('未找到可用卡券!', 200);
            }
            const coupons = row[0] || {};
            coupons.shopowner = [];
            db.query( "SELECT * FROM ?? WHERE coupons_id = ? AND manager_id = ? " , [ 'db_coupons_access' , coupons.id , USER.manager_id ] , function(err, row, fields) {
                if( err ){
                    endQuery();
                    return res.errorEnd('未找到可用卡券!', 200);
                }
                let access = typeof row === 'object' ? row : [];
                for( let index in access ){
                    if( access[index].shopowner_id ){
                        coupons.shopowner.push( access[index].shopowner_id );
                    }
                }
                endQuery(); // 结束当前数据库链接
                return res.successEnd( coupons );
            });
        });
        function endQuery(){
            db.release();// 释放资源
            conn.end(); // 结束当前数据库链接
        }
    });
}