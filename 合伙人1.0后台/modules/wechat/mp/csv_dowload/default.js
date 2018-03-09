'use strict';
const fs = require('fs');
const path = require('path');
const moment = require('moment');
exports.ready = (req, res, that) => {
    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query || {}; // 当前请求传递过来的 GET 数据,
    const body = req.body || {}; // 当前请求传递过来的 POST 数据
    const sideUrl = req.sideUrl;// 当前域名, 一般为 http://www.zsb2b.com:8081/
    const sideLink = sideUrl + ( req.originalUrl || '' ).slice(1);// 当前域名, 一般为 http://www.zsb2b.com:8081/
    const csvFiles = path.join( __dirname , 'files' , query.files_name || '' );
    if( !query.files_name || !fs.existsSync(csvFiles) ){
        return res.errorEnd( '请求无效, 文件不存在' , 200 );
    }
    let newFilesName = moment().format("YYYYMMDDHHmm") +'.csv';
    res.download( csvFiles , newFilesName , function(err){
        try{
            fs.unlinkSync( csvFiles );
        } catch( e ){}
    });
};