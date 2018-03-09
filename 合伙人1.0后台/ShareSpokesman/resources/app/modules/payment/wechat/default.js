
const crypto = require('crypto');// 加密模块
const request = require('request');
'use strict';
exports.ready = (req, res, that) => {
    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query || {}; // 当前请求传递过来的 GET 数据,
    const body = req.body || {}; // 当前请求传递过来的 POST 数据
    const sideUrl = req.sideUrl;// 当前域名, 一般为 http://www.zsb2b.com:8081/
    const sideLink = sideUrl + ( req.originalUrl || '' ).slice(1);// 当前域名, 一般为 http://www.zsb2b.com:8081/
    // const appid = 'wxb1f8283a9e0ef83b';
    // const appsecret = 'b0cd3c3fc97989fc38cc608f40c119f3';
    console.log( sideLink , query, body )
    res.successEnd( 'result' );
}