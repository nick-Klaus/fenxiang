
const crypto = require('crypto');// 加密模块
const request = require('request');
const url = require('url');
const fs = require('fs');
'use strict';
exports.ready = (req, res, that) => {
    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query || {}; // 当前请求传递过来的 GET 数据,
    const body = req.body || {}; // 当前请求传递过来的 POST 数据
    const sideUrl = req.sideUrl;// 当前域名, 一般为 http://www.zsb2b.com:8081/
    const sideLink = sideUrl + ( req.originalUrl || '' ).slice(1);// 来源域名, 一般为 http://www.zsb2b.com/?a=dd
    const appid = 'wxb1f8283a9e0ef83b';
    const appsecret = 'b0cd3c3fc97989fc38cc608f40c119f3';
    const openurl = 'https://open.weixin.qq.com/connect/oauth2/authorize';
    const apiurl = 'https://api.weixin.qq.com/';
    const state  = 'ShareSpokesman' + crypto.createHash('md5').update( ( + new Date() ) + Math.random().toString(36).substr(2) ).digest('hex');
    const redirect_uri = encodeURIComponent('http://ssm.echao.com/ShareSpokesman/wechat_auth.html');
    const current_time = parseInt( ( + new Date() ) / 1000 );
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
                    const now_date_zero = ( new Date().setHours(0, 0, 0, 0) / 1000 );
                    const fans      = await _asyncQuery("select * from ?? where `id`=? ", [ 'db_people' , req.session.fans_id|0 ], 1 );// 获取粉丝数据
                    console.log( 'manager_id' , req.session.manager_id , 'fans_id' , req.session.fans_id );
                    console.log( "授权后回跳链接", req.session.side_link );
                    if( fans.err ){
                        db.rollback(); // 回滚
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd( fans.err , 500 );
                    }

                    const manager   = await _asyncQuery("select * from ?? where `id`=? ", ['db_manager', ( req.session.manager_id|0 ) || fans.row.manager_id ] , 1 );// 获取老板的数据
                    if( manager.err ){
                        db.rollback(); // 回滚
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd( manager.err , 500 );
                    }


                    let manager_id = 0;
                    let prolocutor_id = 0;
                    let clerk_id = 0;
                    if( manager.row && manager.row.id ){
                        manager_id = manager.row.id;
                    }else if( fans.row.manager_id ){
                        manager_id = fans.row.manager_id;
                    }
                    console.log( "邀请者" , fans.row );
                    if( fans.row.id ){
                        prolocutor_id = ( that.isEmpty(fans.row.is_prolocutor) && that.isEmpty(fans.row.is_clerk) ? fans.row.prolocutor_id : fans.row.id ) | 0;
                        clerk_id = ( that.isEmpty(fans.row.is_clerk) ? fans.row.clerk_id : fans.row.id ) | 0;
                    }

                    // 试用者
                    if( !manager.row.id || ( manager.row.extend_time && manager.row.is_extend && manager.row.extend_time < current_time ) ){
                        db.rollback(); // 回滚
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.redirect(url.format({
                            protocol: 'http',
                            host: 'ssm.echao.com',
                            port: '80',
                            query: {fans_id: fans.row.id , source_fans_id: prolocutor_id, extend: manager.row.extend_time },
                            pathname: '/ShareSpokesman/boss/expire',
                        }));
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
                        // if( that.isEmpty(now_fans.row.manager_id) ){
                        //     update.manager_id = manager_id;
                        //     now_fans.row.manager_id = manager_id;
                        // }
                        if( that.isEmpty(now_fans.row.is_clerk) && that.isEmpty(now_fans.row.is_prolocutor) && now_fans.row.id != fans.row.id ){
                            update.clerk_id = clerk_id;
                            update.manager_id = manager_id;
                            update.prolocutor_id = prolocutor_id;
                            now_fans.row.clerk_id = clerk_id;
                            now_fans.row.manager_id = manager_id;
                            now_fans.row.prolocutor_id = prolocutor_id;
                        }

                        if( !now_fans.row.task_days || now_fans.row.task_days != now_date_zero ){
                            let isTask = false;
                            if( !now_fans.row.task_days ){
                                let isTaskQuery  = await _asyncQuery("select * from ?? where `openid`=? AND `manager_id`=? AND `addtime`=? ", [ 'db_people_task' , content.openid , manager_id , now_date_zero ], 1 );// 获取粉丝数据
                                isTask = isTaskQuery.row && isTaskQuery.row.id;
                            }
                            update.task_days = now_date_zero;
                            now_fans.row.task_days = now_date_zero;
                            if( !isTask ){
                                var task_database = {
                                    openid: now_fans.row.openid,
                                    taskcount: 0,
                                    sign_count: 0,
                                    count_do: 0,
                                    addtime: now_date_zero,
                                    create_date: '',
                                    forward: 0,
                                    share: 0,
                                    develop_user: 0,
                                    complete_order: 0,
                                    manager_id: now_fans.row.manager_id,
                                    shopowner_id: now_fans.row.shopowner_id,
                                    clerk_id: now_fans.row.clerk_id,
                                    agent_id: now_fans.row.prolocutor_id,
                                    user_id: now_fans.row.id,
                                    task_type: 0
                                };
                                console.log( "创建粉丝签到表数据" , task_database );
                                const create_task  = await _asyncQuery("INSERT INTO `db_people_task` SET ?", task_database );// 创建粉丝签到表数据
                                if( create_task.err ){
                                    db.rollback(); // 回滚
                                    db.release(); // 释放资源
                                    conn.end(); // 结束当前数据库链接
                                    return res.errorEnd( create_task.err , 500 );
                                }
                            }
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
                        task_days: now_date_zero,
                    };

                    const create_fans  = await _asyncQuery("INSERT INTO `db_people` SET ?", create );// 更新粉丝数据
                    if( create_fans.err ){
                        db.rollback(); // 回滚
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd( create_fans.err , 500 );
                    }
                    var task_database = {
                        openid: create.openid,
                        taskcount: 0,
                        sign_count: 0,
                        count_do: 0,
                        addtime: now_date_zero,
                        create_date: '',
                        forward: 0,
                        share: 0,
                        develop_user: 0,
                        complete_order: 0,
                        manager_id: create.manager_id,
                        shopowner_id: create.shopowner_id,
                        clerk_id: create.clerk_id,
                        agent_id: create.prolocutor_id,
                        user_id: create_fans.row.insertId,
                        task_type: 0
                    };
                    console.log( "创建粉丝签到表数据" , task_database );
                    const create_task  = await _asyncQuery("INSERT INTO `db_people_task` SET ?", task_database );// 创建粉丝签到表数据
                    if( create_task.err ){
                        db.rollback(); // 回滚
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd( create_task.err , 500 );
                    }
                    db.commit();
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    let result = {};
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
            return side_link[0] +'?'+ string_query.join('&') + ( side_hash ? ('#'+ side_hash ) : '' );
        }
    });
}