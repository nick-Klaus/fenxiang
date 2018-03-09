    'use strict';
    // 解决chrome调试工具devtron不可用的问题
    window.__devtron = { require: require, process: process };

    // Node 内置模块
    const fs = require('fs'); // 文件操作模块
    const path = require('path'); // 路径处理模块
    const bodyParser = require('body-parser');
    const multer = require('multer');
    const express = require('express');
    const cookieParser = require('cookie-parser');
    const session = require('express-session');
    const moment = require('moment'); // 时间处理插件
    const that = require('./lib/core.js')
    const app = express();

    that.console();
    app.use(cookieParser());
    app.use(session({
        resave: true, // don't save session if unmodified
        saveUninitialized: false, // don't create session until something stored
        secret: 'love'
    }));
    app.use(bodyParser.text({ limit: '50mb' })); // 50mb
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: true })); // for parsing application/x-www-form-urlencoded 1mb
    app.use(bodyParser.json()); // for parsing application/json


    app.use(multer()); // for parsing multipart/form-data

    window.open_call = {
        api: [],
    };

    let apiUnshift = ( api , status ) => {
        api.status = status;
        open_call.api.unshift( api );
        window.open_call.api = open_call.api.slice( 0 , 50 );
    }

    // 静态文件
    app.use('/static', express.static( path.join( __dirname , '/images') ) );
    // 新建路由
    app.all('*', function(req, res) {
        // console.log( req.body );
        // 跨域设置
        res.header("Access-Control-Allow-Origin", "*");
        res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.header('Access-Control-Allow-Headers', 'Content-Type');

        // 返回错误
        res.errorEnd = (msg, code) => { res.json({ error_code: code || 1, error_msg: msg }); }
        // 返回成功
        res.successEnd = (msg) => { res.json({ error_code: 0, error_msg: '', data: msg }); }
        // 当前域名
        req.sideUrl = req.protocol +'://'+ req.headers.host+ '/';

        if( '/favicon.ico' == req.path ){
            return res.errorEnd('404 Not Found', 404);
        }
        // 加载模块
        let module_file = path.join(__dirname, '/modules/', req.path, '/default.js');

        let api = { path: req.path , method: req.method, url: req.url , header: req.headers , datetime: moment().format("YYYY-MM-DD HH:mm:ss") , files: module_file };
        if ( fs.existsSync(module_file) ) {
            apiUnshift( api , 'SUCCESS' );
            // 删除以下一行代码, 可以取消热加载, 生产模式下, 要删除热加载
            delete require.cache[require.resolve( module_file )];

            // 加载模块
            let module = require(module_file);
            if (that.dataType(module.ready, 'function')) {

                // 验证 Token
                const times = + new Date();
                const query = req.query || {}; // 当前请求传递过来的 GET 数据,
                const body  = req.body || {}; // 当前请求传递过来的 POST 数据
                let token   = body.token || query.token;
                if( !req.cookies.old_user_token ){
                    req.cookies.old_user_token = req.session.user_token || null;
                }
                if( !token ){
                    req.session.user_token  = null;
                }else{
                    that.connect( async ( err , db , conn ) => {
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
                        const fans = await _asyncQuery("select * from ?? where `token`=? ", [ 'db_people' , token ], 1 );// 获取粉丝数据
                        if( !fans.row.id ){
                            req.session.user_token  = null;
                            req.session.user_rows       = {};
                            req.session.user_manager    = {};
                            req.session.user_shopowner  = {};
                        }else{
                            let update = {};
                            req.session.user_manager    = {};
                            req.session.user_shopowner  = {};
                            if( fans.row.is_manager ){
                                const manager   = await _asyncQuery("select * from ?? where `id`=? ", ['db_manager', fans.row.manager_id ] , 1 );// 获取老板的数据
                                if( manager.row.id ){
                                    req.session.user_manager    = manager.row;
                                    if( !fans.row.manager_id && manager.row.id ){
                                        fans.row.manager_id     = manager.row.id;
                                        fans.row.prolocutor_id  = fans.row.id;
                                        update.prolocutor_id    = fans.row.prolocutor_id;
                                        update.manager_id       = manager.row.id;
                                    }
                                }
                            }
                            if( fans.row.is_shopowner ){
                                const shopowner = await _asyncQuery("select * from ?? where `id`=? ", ['db_shopowner', fans.row.shopowner_id ] , 1 );// 获取老板的数据
                                if( shopowner.row.id ){
                                    req.session.user_shopowner  = shopowner.row;
                                    if( !fans.row.shopowner_id && shopowner.row.id ){
                                        fans.row.shopowner_id   = shopowner.row.id;
                                        fans.row.prolocutor_id  = fans.row.id;
                                        update.prolocutor_id    = fans.row.prolocutor_id;
                                        update.shopowner_id     = shopowner.row.id;
                                    }
                                }
                            }
                            if( update.prolocutor_id ){
                                const up_fans  = await _asyncQuery("UPDATE `db_people` SET ? WHERE `id`= ? ", [ update , fans.row.id ] );// 更新粉丝数据
                            }
                            req.session.user_token  = token;
                            req.session.user_rows   = fans.row;
                        }
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return module.ready(req, res, that);
                    });
                    return;
                }
                // 初始化模块
                return module.ready(req, res, that);
            }
        }else{
            apiUnshift( api , 'FAIL' );
        }
        return res.errorEnd("404 Not Found");
    });
    app.listen(8081);