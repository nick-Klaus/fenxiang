/**
 * 2017年9月29日 09:57:45 优化
 */
'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body || {}; // 当前请求传递过来的 POST 数据
    const USER = req.session.user_rows || {};
    const target_shopowner_id = body.target_shopowner_id | 0;
    const clerk_id = body.clerk_id | 0; // 发放卡券的店员ID
    const prolocutor_id = body.prolocutor_id | 0; // 发放卡券的代言人ID

    if( !USER.id ){
        return res.errorEnd('请求错误, Token 验证失败!!', 300);
    }
    if( !/^\d+$/.test(body.coupons_id) || body.coupons_id < 1 ){
        return res.errorEnd('卡券不存在', 200);
    }

    // 链接数据库
    // 链接 / 操作数据库
    that.connect(( err , db , conn ) => {
        let sql  = "SELECT a.*, b.id AS access_id, b.shopowner_id AS access_shopowner_id FROM `db_coupons` AS a, `db_coupons_access` AS b ";
            sql += "WHERE a.id = b.coupons_id AND b.manager_id = ? AND b.shopowner_id = ? AND a.id = ? AND a.status = 1 ";
        db.query( sql , [ USER.manager_id , USER.shopowner_id , body.coupons_id ] , function(err, row, fields) {
            if( err || !row ){
                endQuery();
                return res.errorEnd('未找到可用卡券!', 200);
            }
            const coupons = row[0] || {};
            if( !coupons.id ){
                endQuery();
                return res.errorEnd('当前店铺未找到可用的卡券!', 200);
            }
            if( !coupons.total ){
                endQuery();
                return res.errorEnd('当前可用卡券不足!', 200);
            }
            db.query( "SELECT * FROM `db_coupons_record` WHERE coupons_id = ? AND user_id = ? AND openid = ? AND manager_id = ? " , [ coupons.id , USER.id , USER.openid , USER.manager_id ] , function(err, row, fields) {
                if( err ){
                    endQuery();
                    return res.errorEnd('卡券发放失败!', 200);
                }
                const sendCoupons = row[0] || {};
                if( sendCoupons.id ){
                    endQuery();
                    return res.errorEnd('您已经领取过该卡券了!', 200);
                }
                let create = {
                    manager_id: USER.manager_id,
                    shopowner_id: USER.shopowner_id,
                    target_shopowner_id: target_shopowner_id || USER.shopowner_id,
                    clerk_id: clerk_id || USER.clerk_id,
                    openid: USER.openid,
                    user_id: USER.id,
                    coupons_id: coupons.id,
                    used_date: null,
                    order_no: null,
                    order_money: null,
                    coupons_worth: null,
                };
                create.prolocutor_id = prolocutor_id || create.clerk_id; // 发放卡券的 店员 或 代言人
                db.query( "INSERT INTO ?? SET ?" , [ 'db_coupons_record' , create ] , function( err, result , fields ){
                    if( err || !result.insertId ){
                        endQuery(); // 结束当前数据库链接
                        return res.errorEnd('卡券领取失败!', 200);
                    }
                    endQuery(); // 结束当前数据库链接
                    return res.successEnd( result.insertId );
                });
            });
        });
        function endQuery(){
            db.release();// 释放资源
            conn.end(); // 结束当前数据库链接
        }
    });

}