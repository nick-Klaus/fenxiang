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
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据

    // that 里面有什么可以调用的 你可以看 resources\app\lib\core.js 文件!
    // 例如 that.isEmpty(123) // 判断传入的值, 是否是空 具体看方法说明!!!

    // 链接数据库
    // 链接 / 操作数据库

    
    if(req.session.user_rows == null){
         return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
     }
    if(req.session.user_token != body.token){
         return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
    }
    if(req.session.user_shopowner== {}){
        if(req.session.user_manager== {}){
            return res.errorEnd('当前用户 非 店长权限', 300);
        }
    }
    var user = req.session.user_rows;
    that.connect((err, db,conn) => {
                
    db.query("select count(b.id) order_count,a.realname,a.nickname,user_level,mobile,c.shop_name,a.createtime,a.amount,a.coupon,d.profit_all,d.share_price_all,d.commission_price_all,sum(b.total_price) order_total,count(a.id) people_num,d.forward_all,d.profit_all,d.share_all,a.headimgurl from ((`db_people` a  inner join `db_order` b on a.id = b.cid or a.id = b.pid   ) inner join `db_shop` c on c.id = a.shopowner_id) inner join `db_activity_log` d on a.openid = d.openid  where a.id = ? and b.status = 1 and b.pay_status = 3 ",[ body.id] , function(err, row, fields) {
    // 数据获取失败
        if(row['0'].share_price_all == 0 ){
            row['0']['share_price_all1'] = 0;
        }else{
            row['0']['share_price_all1'] = Number(row['0'].share_price_all) / Number(row['0'].profit_all); 
            row['0']['share_price_all1'] = row['0']['share_price_all1'].toFixed(2);
        }
        if(row['0'].commission_price_all == 0){
            row['0']['commission_price_all1'] = 0;
        }else{
            row['0']['commission_price_all1'] = Number(row['0'].commission_price_all) / Number(row['0'].commission_price_all); 
            row['0']['commission_price_all1'] = row['0']['commission_price_all1'].toFixed(2);
        }
        if(row['0']['commission_price_all1'] == "Infinity"){
            row['0']['commission_price_all1'] = 0;
        }
        if(row['0']['share_price_all1'] == "Infinity"){
            row['0']['share_price_all1'] = 0;
        }
        if(row['0']['share_price_all1'] == "NaN"){
            row['0']['share_price_all1'] = 0;
        }
        if(row['0']['commission_price_all1'] == "NaN"){
            row['0']['commission_price_all1'] = 0;
        }
        
        if (err) {
            return res.errorEnd('没有找到可用数据1', 200);
        }
        db.release(); // 释放资源
        conn.end(); // 结束当前数据库链接
        return res.successEnd(row);
    });
            
        
    });


}