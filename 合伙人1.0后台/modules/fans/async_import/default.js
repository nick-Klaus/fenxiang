
const crypto = require('crypto');// 加密模块

'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query || {}; // 当前请求传递过来的 GET 数据,
    const body = req.body || {}; // 当前请求传递过来的 POST 数据



    // var times = + new Date();
    // var token = crypto.createHash('md5').update( times + Math.random().toString(36).substr(2) ).digest('hex');
    // req.session.user_token  = token;
    // req.session.user_expire = times + 720000;// 2小时内有效

    // return res.successEnd( req.session );

    // 必须是 POST 提交 且带有 GET.fans_id 才能通过!!
    if( method != 'POST' || ( !/^\d+$/.test(query.fans_id) && !/^\d+$/.test(query.manager_id) ) ){
        return res.errorEnd( 'HTTP 400' , 400 );
    }
    // openid uniacid 验证失败
    if( !body.openid || !/^[a-zA-Z0-9_-]{28,}$/.test(body.openid) || body.uniacid != 4 ){
        return res.errorEnd( '请求无效' , 400 );
    }
    // 链接数据库
    // 链接 / 操作数据库
    // 有不懂, 看这个 http://blog.csdn.net/zxsrendong/article/details/17006185
    that.connect( ( err , db , conn ) => {
        db.beginTransaction( async function(err){
            const _asyncQuery = (sql , params , limit ) => {
                return  new Promise( resolve => {
                    db.query( sql , params , function(err, row, fields) {
                        let rows = null;
                        if( limit == 1 ){
                            rows = row ? ( row[0] || {} ) : {};
                        }else if( limit >= 1 ){
                            rows = row ? ( row.slice( 0 , limit ) ) : {};
                        }else{
                            rows = row;
                        }
                        resolve( { err: err , row: rows , fields: fields , that: this } );
                    });
                })
            }
            const manager   = await _asyncQuery("select * from ?? where `id`=? ", ['db_manager', query.manager_id|0 ] , 1 );// 获取老板的数据
            const fans      = await _asyncQuery("select * from ?? where `id`=? ", [ 'db_people' , query.fans_id|0 ], 1 );// 获取粉丝数据
            if( manager.err || fans.err ){
                db.rollback(); // 回滚
                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd( manager.err || fans.err , 500 );
            }
            let manager_id = 0;
            let prolocutor_id = 0;
            if( manager.row.id ){
                manager_id = manager.row.id;
            }else if( fans.row.manager_id ){
                manager_id = fans.row.manager_id;
            }
            if( fans.row.id ){
                prolocutor_id = ( that.isEmpty(fans.row.is_prolocutor) && that.isEmpty(fans.row.is_clerk) ? fans.row.prolocutor_id : fans.row.id ) | 0;
            }
            const times     = + new Date();
            const now_fans  = await _asyncQuery("select * from ?? where `openid`=? AND `manager_id`=? ", [ 'db_people' , body.openid , manager_id ], 1 );// 获取粉丝数据
            if( now_fans.err ){
                db.rollback(); // 回滚
                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd( now_fans.err , 500 );
            }
            var token = crypto.createHash('md5').update( times + Math.random().toString(36).substr(2) ).digest('hex');
            if( now_fans.row.id ){
                // 更新粉丝信息
                let update = {};
                update.token = token;
                if( that.isEmpty(now_fans.row.manager_id) ){
                    update.manager_id = manager_id;
                    now_fans.row.manager_id = manager_id;
                }
                if( that.isEmpty(now_fans.row.is_clerk) && that.isEmpty(fans.row.is_prolocutor) && now_fans.row.id != fans.row.id ){
                    update.prolocutor_id = prolocutor_id;
                    now_fans.row.prolocutor_id = prolocutor_id;
                }
                const up_fans  = await _asyncQuery("UPDATE `db_people` SET ? WHERE `id`=? ", [ update , now_fans.row.id ] );// 更新粉丝数据
                if( up_fans.err ){
                    db.rollback(); // 回滚
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd( up_fans.err , 500 );
                }
                db.commit();
                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接
                let result = {};
                result.token = token;
                if( now_fans.row.is_clerk || now_fans.row.is_prolocutor ){
                    result.fans_id = now_fans.row.id;
                }
                if( now_fans.row.prolocutor_id ){
                    result.source_fans_id = prolocutor_id;
                }
                console.log( result );
                return res.successEnd( result );
            }
            console.log( prolocutor_id )
            let create = {
                manager_id: manager_id,
                prolocutor_id: prolocutor_id,
                shopowner_id: fans.row.shopowner_id | 0,
                clerk_id: fans.row.clerk_id | 0,
                is_clerk: '0',
                is_prolocutor: '0',
                openid: body.openid,
                createtime: body.create_time,
                password_hash: Math.random().toString(12).substr(0,16),
                amount: 0,
                cash: 0,
                consume: 0,
                user_level: 1,
                token: token,
            };
            const create_fans  = await _asyncQuery("INSERT INTO `db_people` SET ?", create );// 更新粉丝数据
            if( create_fans.err ){
                db.rollback(); // 回滚
                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd( create_fans.err , 500 );
            }
            db.commit();
            db.release(); // 释放资源
            conn.end(); // 结束当前数据库链接
            let result = {};
            result.token = token;
            if( now_fans.row.manager_id ){
                result.manager_id = now_fans.row.manager_id;
            }
            if( now_fans.row.prolocutor_id ){
                result.fans_id = now_fans.row.prolocutor_id;
            }
            if( now_fans.row.prolocutor_id ){
                result.source_fans_id = prolocutor_id;
            }
            console.log( result );
            return res.successEnd( result );
        });
    });

}