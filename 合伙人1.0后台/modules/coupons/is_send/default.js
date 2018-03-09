'use strict';
const moment = require('moment');
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body || {}; // 当前请求传递过来的 POST 数据
    const USER = req.session.user_rows || {};
    const coupons_id = body.coupons_id | 0;
    const openid = body.openid || '';
    const user_id = body.user_id | 0;
    const is_get_user = body.is_get_user | 0;


    if( !USER.id ){
        return res.errorEnd('请求错误, Token 验证失败!!', 300);
    }
    if( !coupons_id ){
        return res.errorEnd('没有找到可用卡券', 200);
    }
    if( !openid && !user_id ){
        return res.errorEnd('用户不存在!!', 200);
    }

    // 链接数据库
    // 链接 / 操作数据库
    that.connect(( err , db , conn ) => {
        db.beginTransaction(function(err){
            let condition = '';
            if( openid ){
                condition += " AND openid = '"+ openid +"'";
            }
            if( user_id && user_id > 0 ){
                condition += " AND user_id = "+ user_id +"";
            }
            let sql  = "SELECT a.*,b.start_time AS start_time,b.end_time AS end_time, b.headline, b.types, b.worth, b.content, b.backdrop, b.status AS coupons_status FROM ";
                sql += "`db_coupons_record` AS a, `db_coupons` AS b ";
                sql += "WHERE b.id = a.coupons_id AND a.manager_id = ? AND a.coupons_id = ? "+ condition +" LIMIT 1 ";
            db.query( sql , [ USER.manager_id , coupons_id ] , function(err, row, fields) {
                if( err || !row || !row[0] ){
                    endQuery();
                    return res.errorEnd('未找到可用卡券!', 200);
                }
                let coupons = row[0] || {};

                coupons.is_inoperative  = !moment().isAfter( coupons.start_time ); // true 卡券尚未生效
                coupons.is_expired      = moment().isAfter( coupons.end_time ); // true 卡券已过期

                coupons.clerk_data          = {};
                coupons.used_data           = {};
                coupons.used_clerk_data     = {};
                coupons.appointment_data    = {};

                let field = "id,manager_id,shopowner_id,clerk_id,prolocutor_id,is_clerk,is_prolocutor,nickname,sex,headimgurl,realname,mobile,is_manager,is_shopowner";
                db.query( "SELECT "+ field +" FROM ?? WHERE id IN( ? , ? , ? )" , [ 'db_people' , coupons.clerk_id | 0, coupons.used_clerk_id | 0 , is_get_user ? ( coupons.user_id | 0 ) : null ] , function(err, row, fields) {
                    if( !err && row ){
                        for( var index in row ){
                            if( row[index].id == coupons.clerk_id ){
                                coupons.clerk_data = row[index];
                            }
                            if( row[index].id == coupons.used_clerk_id ){
                                coupons.used_clerk_data = row[index];
                            }
                            if( row[index].id == coupons.user_id ){
                                coupons.used_data = row[index];
                            }
                        }
                    }
                    db.query( "SELECT * FROM ?? WHERE coupons_record_id = ? LIMIT 1" , [ 'db_appointment' , coupons.id ] , function(err, row, fields) {
                        if( !err && row ){
                            coupons.appointment_data    = row[0] ? row[0] : {};
                        }
                        endQuery(); // 结束当前数据库链接
                        return res.successEnd( coupons );
                    });
                });
            });
        });
        function endQuery(){
            db.release();// 释放资源
            conn.end(); // 结束当前数据库链接
        }
    });
}