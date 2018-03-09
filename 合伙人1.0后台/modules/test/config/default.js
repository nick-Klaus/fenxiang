// Node 内置模块
// const fs = require('fs'); // 文件操作模块
// const url = require('url'); // 链接处理模块
// const path = require('path'); // 路径处理模块
// const http = require('http'); // 网页请求模块
// const crypto = require('crypto');// 加密模块
// const child_process = require('child_process');// 进程通信模块
// 第三方模块
// const ftp = require('ftp');// FTP模块
// const moment = require('moment'); // 时间处理插件

'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query || {}; // 当前请求传递过来的 GET 数据,
    const body = req.body || {}; // 当前请求传递过来的 POST 数据
    const sideUrl = req.sideUrl || '';// 当前域名, 一般为 http://www.zsb2b.com:8081/

    // that 里面有什么可以调用的 你可以看 resources\app\lib\core.js 文件!
    // 例如 that.isEmpty(123) // 判断传入的值, 是否是空 具体看方法说明!!!


    // 整个文件走完后, 必须调用 res.successEnd() 或 res.errorEnd() 来返回给接口调用方, 告诉对方, 当前请求的操作状态,
    // 如果你的这个方法里面有 回调, 那么这个调用必须放在最后的回调里面!!!
    // 操作正确 返回取出的数据
    return res.successEnd({
        user_token: req.session.user_token,
        user_rows: req.session.user_rows,
        user_manager: req.session.user_manager,
        user_shopowner: req.session.user_shopowner,
        sideUrl: sideUrl,
    });

}