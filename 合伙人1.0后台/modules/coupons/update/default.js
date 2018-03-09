/**
 * 2017年9月29日 10:00:18 优化
 */
'use strict';
const moment = require('moment');
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body || {}; // 当前请求传递过来的 POST 数据
    const USER = req.session.user_rows || {};


    let shopowner = body.shopowner || [];
    let reg_text = /^.{5,80}$/;
    let reg_date = /^([1-9]\d{3}).(0[1-9]|1[0-2]|[1-9]).(0[1-9]|[1-2][0-9]|3[0-1]|[1-9])(.(20|21|22|23|[1-9]|[0-1]\d)(:([1-9]|[0-5]\d))?(:([1-9]|[0-5]\d))?)?$/;// 时间正则

    if( !USER.id ){
        return res.errorEnd('请求错误, Token 验证失败!!', 300);
    }
    if( !USER.is_shopowner ){
        return res.errorEnd('创建卡券失败, 您的权限不足', 200);
    }
    if( !body.id ){
        return res.errorEnd('没有找到相关卡券', 200);
    }
    const update = {
        total: body.total | 0,
        start_time: body.start_time,
        end_time: body.end_time,
        headline: body.headline || '',
        worth: parseFloat( body.worth ) || 0,
        content: body.content || '',
        backdrop: body.backdrop || '',
    };
    if( !update.headline || !reg_text.test( update.headline ) ){
        return res.errorEnd('卡券标题必须在 5 至 80 字符之间', 200);
    }
    if( !reg_date.test(update.start_time) || !reg_date.test(update.end_time) ){
        return res.errorEnd('请设置有效卡券生效时间', 200);
    }
    if( !moment( update.start_time ).isBefore( update.end_time ) ){
        return res.errorEnd('请设置有效卡券生效时间', 200);
    }
    if( moment( update.end_time ).diff( moment( update.start_time ) , 'Minute' ) <= 30 ){
        return res.errorEnd('卡券有效时间 必须大于 30 分钟', 200);
    }
    // 链接数据库
    // 链接 / 操作数据库
    that.connect(( err , db , conn ) => {
        db.beginTransaction(function(err){
            // 事物创建失败
            if (err) {
                return res.errorEnd('初始化失败', 200);
            }
            db.query("UPDATE ?? SET ? WHERE `id`= ? LIMIT 1", [ 'db_coupons' , update , body.id ] , function(err, row, fields) {
                if( err || !row.affectedRows ){
                    db.rollback();
                    endQuery(); // 结束当前数据库链接
                    return res.errorEnd('卡券更新失败!', 200);
                }
                db.query( "DELETE FROM ?? WHERE `manager_id` = ? AND `coupons_id` = ? " , [ 'db_coupons_access' , USER.manager_id , body.id ] , function( err, result , fields ){
                    if( err ){
                        db.rollback();
                        endQuery(); // 结束当前数据库链接
                        return res.errorEnd('卡券更新失败!', 200);
                    }
                    if( shopowner.length < 1 ){
                        shopowner.push( USER.shopowner_id );
                    }
                    let accessInsert    = [];
                    let shopownerAccess = shopowner.filter(function (item, index, self) { return self.indexOf(item) == index; });
                    for( let index in shopownerAccess ){
                        accessInsert.push( [ USER.manager_id , shopownerAccess[index] , body.id ] );
                    }
                    db.query( "INSERT INTO ?? ( manager_id , shopowner_id , coupons_id ) VALUES ?" , [ 'db_coupons_access' , accessInsert ] , function( err, result , fields ){
                        if( err || !result.insertId ){
                            db.rollback();
                            endQuery(); // 结束当前数据库链接
                            return res.errorEnd('卡券更新失败!', 200);
                        }
                        db.commit();
                        endQuery(); // 结束当前数据库链接
                        return res.successEnd( 'success' );
                    });
                });
            });

            function endQuery(){
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
            }
        })
    });
}