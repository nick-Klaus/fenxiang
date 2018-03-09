'use strict';
const moment = require('moment');
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body || {}; // 当前请求传递过来的 POST 数据
    const USER = req.session.user_rows || {};
    const user_id = body.user_id | 0;
    const coupons_record_id = body.coupons_record_id | 0;
    const submit = body.submit || '';


    if( !USER.id ){
        return res.errorEnd('请求错误, Token 验证失败!!', 300);
    }
    if( !USER.is_clerk ){
        return res.errorEnd('操作失败, 您的权限不足', 200);
    }
    if( !user_id || !coupons_record_id ){
        return res.errorEnd('没有找到可用卡券', 200);
    }

    // 链接数据库
    // 链接 / 操作数据库
    that.connect(( err , db , conn ) => {
        db.beginTransaction(function(err){
            let sql  = "SELECT a.*,b.start_time AS start_time,b.end_time AS end_time, b.headline, b.types, b.worth, b.content, b.backdrop, b.status AS coupons_status FROM ";
                sql += "`db_coupons_record` AS a, `db_coupons` AS b ";
                sql += "WHERE b.id = a.coupons_id AND a.user_id = ? AND a.manager_id = ? AND a.id = ? LIMIT 1 ";
            db.query( sql , [ user_id , USER.manager_id , coupons_record_id ] , function(err, row, fields) {
                if( err || !row ){
                    endQuery();
                    return res.errorEnd('未找到可用卡券!', 200);
                }
                let coupons = row[0] || {};

                coupons.is_inoperative  = !moment().isAfter( coupons.start_time ); // true 卡券尚未生效
                coupons.is_expired      = moment().isAfter( coupons.end_time ); // true 卡券已过期

                if( submit ){
                    if( coupons.order_no || coupons.used_date ){
                        endQuery();
                        return res.errorEnd('该卡券已被使用!', 200);
                    }
                    if( !coupons.coupons_status || !coupons.status ){
                        endQuery();
                        return res.errorEnd('该卡券暂不可用!', 200);
                    }
                    if( coupons.is_inoperative ){
                        endQuery();
                        return res.errorEnd('该卡券尚未生效!', 200);
                    }
                    if( coupons.is_expired ){
                        endQuery();
                        return res.errorEnd('该卡券已过期!', 200);
                    }
                    let update = {
                        order_no: body.order_no || '-',
                        order_money: parseFloat( body.order_money ) || 0,
                        used_clerk_id: USER.id
                    };
                    db.query("UPDATE ?? SET ? WHERE `id`= ? AND `manager_id` = ? LIMIT 1", [ 'db_coupons_record' , update , coupons.id , USER.manager_id ] , function(err, row, fields) {
                        if( err || !row.affectedRows ){
                            db.rollback();
                            endQuery(); // 结束当前数据库链接
                            return res.errorEnd('卡券核销失败!', 200);
                        }
                        db.commit();
                        endQuery(); // 结束当前数据库链接
                        return res.successEnd( 'success' );
                    });
                    return ;
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