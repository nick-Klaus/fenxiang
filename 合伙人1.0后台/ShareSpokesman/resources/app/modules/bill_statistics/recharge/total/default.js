const mysql  = require('mysql');// Mysql模块
'use strict';
exports.ready = (req, res, that) => {
    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query || {}; // 当前请求传递过来的 GET 数据,
    const body = req.body || {}; // 当前请求传递过来的 POST 数据
    const sideUrl = req.sideUrl;// 当前域名, 一般为 http://www.zsb2b.com:8081/
    const sideLink = sideUrl + ( req.originalUrl || '' ).slice(1);// 当前域名, 一般为 http://www.zsb2b.com:8081/

    const requestKeys   = '93uUkCx6pXEzzWnUhmDC2gDcgawgSyw32tAVkY5vp1tdW0eZiJ';
    if( !body.key || body.key !== requestKeys ){
        return res.errorEnd( '请求无效' , 400 );
    }

    const result = {
        recharge: {// 充值
            total_sum: 0,// 充值总订单数
            ptice_sum: 0,// 充值总金额
            total_suceed: 0,// 有效充值订单数
            ptice_suceed: 0,// 有效充值金额
        },
        refund: {// 退款
            total_sum: 0,// 退款总订单数
            ptice_sum: 0,// 退款总金额
            total_suceed: 0,// 有效退款订单数
            ptice_suceed: 0,// 有效退款金额
        },
        extract: {// 提现
            total_sum: 0,// 退款总订单数
            ptice_sum: 0,// 退款总金额
            total_suceed: 0,// 有效退款订单数
            ptice_suceed: 0,// 有效退款金额
        }
    };
    that.connect( async ( err , db , conn ) => {
        const _asyncQuery = (sql , params , limit ) => {
            return  new Promise( resolve => {
                db.query( sql , params , function(err, row, fields) {
                    this.result_error   = err;
                    this.result_base    = row;
                    this.result_fields  = fields;
                    if( limit == 1 ){
                        this.result_data = row ? ( row[0] || {} ) : {};
                    }else if( limit >= 1 ){
                        this.result_data = row ? ( row.slice( 0 , limit ) ) : {};
                    }else{
                        this.result_data = row;
                    }
                    resolve( this );
                });
            })
        }
        // 充值总订单数
        let recharge_total = await _asyncQuery("SELECT COUNT(*) AS total_sum , SUM(real_pay) AS ptice_sum FROM ?? WHERE 1 LIMIT 1", ['db_manager_recharge'] , 1 );
        result.recharge.total_sum = recharge_total.result_data.total_sum | 0;
        result.recharge.ptice_sum = parseFloat( recharge_total.result_data.ptice_sum ) || 0;
        // 有效充值总订单数
        let recharge_succed = await _asyncQuery("SELECT COUNT(*) AS total_suceed , SUM(real_pay) AS ptice_suceed FROM ?? WHERE `status` = 2 LIMIT 1", ['db_manager_recharge'] , 1 );
        result.recharge.total_suceed = recharge_succed.result_data.total_suceed | 0;
        result.recharge.ptice_suceed = parseFloat( recharge_succed.result_data.ptice_suceed ) || 0;

        // 退款总订单数
        let refund_total = await _asyncQuery("SELECT COUNT(*) AS total_sum , SUM(real_pay) AS ptice_sum FROM ?? WHERE 1 LIMIT 1", ['db_manager_refund'] , 1 );
        result.refund.total_sum = refund_total.result_data.total_sum | 0;
        result.refund.ptice_sum = parseFloat( refund_total.result_data.ptice_sum ) || 0;
        // 有效退款总订单数
        let refund_succed = await _asyncQuery("SELECT COUNT(*) AS total_suceed , SUM(real_pay) AS ptice_suceed FROM ?? WHERE `status` = 1 LIMIT 1", ['db_manager_refund'] , 1 );
        result.refund.total_suceed = refund_succed.result_data.total_suceed | 0;
        result.refund.ptice_suceed = parseFloat( refund_succed.result_data.ptice_suceed ) || 0;

        // 退款总订单数
        let extract_total = await _asyncQuery("SELECT COUNT(*) AS total_sum , SUM(real_pay) AS ptice_sum FROM ?? WHERE 1 LIMIT 1", ['db_manager_tixian'] , 1 );
        result.extract.total_sum = extract_total.result_data.total_sum | 0;
        result.extract.ptice_sum = parseFloat( extract_total.result_data.ptice_sum ) || 0;
        // 有效退款总订单数
        let extract_succed = await _asyncQuery("SELECT COUNT(*) AS total_suceed , SUM(real_pay) AS ptice_suceed FROM ?? WHERE `status` = 1 LIMIT 1", ['db_manager_tixian'] , 1 );
        result.extract.total_suceed = extract_succed.result_data.total_suceed | 0;
        result.extract.ptice_suceed = parseFloat( extract_succed.result_data.ptice_suceed ) || 0;

        conn.end(); // 结束当前数据库链接
        return res.successEnd( result );
    });

    // return res.successEnd( 666 );
};