'use strict';
const moment = require('moment');
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body || {}; // 当前请求传递过来的 POST 数据
    const USER = req.session.user_rows || {};
    const user_id = body.user_id | 0;


    if( !USER.id ){
        return res.errorEnd('请求错误, Token 验证失败!!', 300);
    }

    // 链接数据库
    // 链接 / 操作数据库
    that.connect(( err , db , conn ) => {
        db.beginTransaction(function(err){
            let sql  = "SELECT a.*,b.shop_name, b.phone, b.address FROM ";
                sql += "`db_shopowner` AS a, `db_shop` AS b ";
                sql += "WHERE b.id = a.shop_id AND a.id = ? LIMIT 1 ";
            db.query( sql , [ body.shopowner_id ] , function(err, row, fields) {
                if( err || !row || !row[0] ){
                    endQuery();
                    return res.errorEnd('未找到可用卡券!', 200);
                }
                let coupons = row[0] || {};

                coupons.clerk_data = {};
                coupons.prolocutor_data = {};

                let field = "id,manager_id,shopowner_id,clerk_id,prolocutor_id,is_clerk,is_prolocutor,nickname,sex,headimgurl,realname,mobile,is_manager,is_shopowner";
                db.query( "SELECT "+ field +" FROM ?? WHERE id IN( ? , ? )" , [ 'db_people' , body.clerk_id | 0, body.prolocutor_id | 0 ] , function(err, row, fields) {
                    if( !err && row ){
                        for( var index in row ){
                            if( row[index].id == body.clerk_id ){
                                coupons.clerk_data = row[index];
                            }
                            if( row[index].id == body.prolocutor_id ){
                                coupons.prolocutor_data = row[index];
                            }
                        }
                        endQuery(); // 结束当前数据库链接
                        return res.successEnd( coupons );
                    } else {
                        endQuery();
                        return res.errorEnd('没有找到可用数据', 200);
                    }
                });
            });
        });
        function endQuery(){
            db.release();// 释放资源
            conn.end(); // 结束当前数据库链接
        }
    });
}