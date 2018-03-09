'use strict';
exports.ready = (req, res, that) => {
    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query || {}; // 当前请求传递过来的 GET 数据,
    const body = req.body || {}; // 当前请求传递过来的 POST 数据
    const sideUrl = req.sideUrl || '';// 当前域名, 一般为 http://www.zsb2b.com:8081/
    console.log( "重启" );
    if( query.token == '13537681890' ){
        console.log( "重启成功" );
        that.win.reload();
        return res.successEnd( '重启成功' );
    }
    return res.errorEnd( '权限不足' );
};