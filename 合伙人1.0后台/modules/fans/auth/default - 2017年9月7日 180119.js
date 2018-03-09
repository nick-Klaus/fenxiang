
const crypto = require('crypto');// 加密模块
const request = require('request');
'use strict';
exports.ready = (req, res, that) => {
    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query || {}; // 当前请求传递过来的 GET 数据,
    const body = req.body || {}; // 当前请求传递过来的 POST 数据
    const sideUrl = req.sideUrl;// 当前域名, 一般为 http://www.zsb2b.com:8081/
    const sideLink = sideUrl + ( req.originalUrl || '' ).slice(1);// 当前域名, 一般为 http://www.zsb2b.com:8081/
    const appid = 'wxb1f8283a9e0ef83b';
    const appsecret = 'b0cd3c3fc97989fc38cc608f40c119f3';
    const openurl = 'https://open.weixin.qq.com/connect/oauth2/authorize';
    const apiurl = 'https://api.weixin.qq.com/';
    const state  = 'ShareSpokesman' + crypto.createHash('md5').update( ( + new Date() ) + Math.random().toString(36).substr(2) ).digest('hex');
    const redirect_uri = encodeURIComponent('http://ssm.echao.com/ShareSpokesman/wechat_auth.html');
    if( !query.code ){
        req.session.side_link   = query.url ? decodeURIComponent(query.url) : '';
        req.session.fans_id     = query.fans_id | 0;
        req.session.manager_id  = query.manager_id | 0;
        console.log( "来源", sideLink , query , body );
        console.log( "A 授权ID", state );
        console.log( "开始进入授权流程", 'manager_id' , req.session.manager_id, 'fans_id' , req.session.fans_id );
        console.log( "授权后回跳链接", req.session.side_link );
        let auth_url = '?appid='+ appid +'&redirect_uri='+ redirect_uri +'&response_type=code&scope=snsapi_base&state='+ state +'#wechat_redirect';
        res.redirect( openurl + auth_url );
        return;
    }
    let authorization_url = 'sns/oauth2/access_token?appid='+ appid +'&secret='+ appsecret +'&code='+ query.code +'&grant_type=authorization_code';
    request( apiurl + authorization_url , function (error, response, req_body) {
        let content = {};
        try{
            content = JSON.parse(req_body) || {};
        } catch ( e ){ }
        console.log( "B 授权ID", ( query.state || '' ).substr(14) );
        console.log( "微信授权结果", content );
        if( content.access_token && content.openid ){
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
                    const manager   = await _asyncQuery("select * from ?? where `id`=? ", ['db_manager', req.session.manager_id|0 ] , 1 );// 获取老板的数据
                    const fans      = await _asyncQuery("select * from ?? where `id`=? ", [ 'db_people' , req.session.fans_id|0 ], 1 );// 获取粉丝数据
                    console.log( 'manager_id' , req.session.manager_id , 'fans_id' , req.session.fans_id );
                    console.log( "授权后回跳链接", req.session.side_link );
                    if( manager.err || fans.err ){
                        db.rollback(); // 回滚
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd( manager.err || fans.err , 500 );
                    }
                    let manager_id = 0;
                    let prolocutor_id = 0;
                    if( manager.row && manager.row.id ){
                        manager_id = manager.row.id;
                    }else if( fans.row.manager_id ){
                        manager_id = fans.row.manager_id;
                    }
                    console.log( "邀请者" , fans.row );
                    if( fans.row.id ){
                        prolocutor_id = ( that.isEmpty(fans.row.is_prolocutor) && that.isEmpty(fans.row.is_clerk) ? fans.row.prolocutor_id : fans.row.id ) | 0;
                    }
                    const now_fans  = await _asyncQuery("select * from ?? where `openid`=? AND `manager_id`=? ", [ 'db_people' , content.openid , manager_id ], 1 );// 获取粉丝数据
                    if( now_fans.err ){
                        db.rollback(); // 回滚
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd( now_fans.err , 500 );
                    }
                    if( now_fans.row.id ){
                        // 更新粉丝信息
                        let update = {};
                        update.token = ( query.state || '' ).substr(14);
                        if( that.isEmpty(now_fans.row.manager_id) ){
                            update.manager_id = manager_id;
                            now_fans.row.manager_id = manager_id;
                        }
                        if( that.isEmpty(now_fans.row.is_clerk) && that.isEmpty(now_fans.row.is_prolocutor) && now_fans.row.id != fans.row.id ){
                            update.prolocutor_id = prolocutor_id;
                            now_fans.row.prolocutor_id = prolocutor_id;
                        }
                        console.log( "更新粉丝信息" , update );
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
                        // result.token = token;
                        if( now_fans.row.is_clerk || now_fans.row.is_prolocutor ){
                            result.fans_id = now_fans.row.id;
                        }
                        if( now_fans.row.prolocutor_id ){
                            result.source_fans_id = prolocutor_id;
                        }
                        let side_link = locationPath( result )
                        console.log( "目标参数", result );
                        console.log( "回跳到目标", side_link );
                        return side_link ? res.redirect( side_link ) : res.successEnd( result );
                    }
                    let create = {
                        manager_id: manager_id,
                        prolocutor_id: prolocutor_id,
                        shopowner_id: fans.row.shopowner_id | 0,
                        clerk_id: fans.row.clerk_id | 0,
                        is_clerk: '0',
                        is_prolocutor: '0',
                        openid: content.openid,
                        createtime: Math.round(new Date().getTime() / 1000),
                        password_hash: Math.random().toString(12).substr(0,16),
                        amount: 0,
                        cash: 0,
                        consume: 0,
                        user_level: 1,
                        token: ( query.state || '' ).substr(14),
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
                    // result.token = token;
                    if( now_fans.row.manager_id ){
                        result.manager_id = now_fans.row.manager_id;
                    }
                    if( now_fans.row.prolocutor_id ){
                        result.fans_id = now_fans.row.prolocutor_id;
                    }
                    if( now_fans.row.prolocutor_id ){
                        result.source_fans_id = prolocutor_id;
                    }
                    let side_link = locationPath( result )
                    console.log( "目标参数", result );
                    console.log( "回跳到目标", side_link );
                    return side_link ? res.redirect( side_link ) : res.successEnd( result );
                });
            });
        }else{
            return res.errorEnd( 'fail' , 500 );
        }
        function locationPath( param ){
            if( !req.session.side_link ){ return false; }
            let side_link  = req.session.side_link.split('?');
            let side_hash  = req.session.side_link.split('#')[1] || '';
            let side_param = side_link[1] ? ( side_link[1].split('#')[0].split('&') || [] ) : [];
            let side_query = param || {};
            let string_query = [];
            for( var index in side_param ){
                var params = side_param[index].split('=') || [];
                if( !side_query.hasOwnProperty( params[0] ) ){
                    side_query[ params[0] ] = params[1] || '';
                }
            }
            for( var index in side_query ){
                string_query.push( index +'='+ side_query[index] );
            }
            return side_link[0] +'?'+ string_query.join('&') +'#'+ side_hash;
        }
    });
}