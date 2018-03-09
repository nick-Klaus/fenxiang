'use strict';
exports.ready = (req, res, that) => {
    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query || {}; // 当前请求传递过来的 GET 数据,
    const body = req.body || {}; // 当前请求传递过来的 POST 数据
    const sideUrl = req.sideUrl;// 当前域名, 一般为 http://www.zsb2b.com:8081/
    const sideLink = sideUrl + ( req.originalUrl || '' ).slice(1);// 当前域名, 一般为 http://www.zsb2b.com:8081/
    const paymentMysql  = { host: 'ilsommo.echao.com', user: 'ilsommo', password: 'ilsommo123', database: 'eboxweixin' };

    const requestKeys   = '93uUkCx6pXEzzWnUhmDC2gDcgawgSyw32tAVkY5vp1tdW0eZiJ';
    if( !body.token || body.token !== requestKeys ){
        return res.errorEnd( '请求无效' , 400 );
    }

    that.connect( paymentMysql , async ( err , db , conn ) => {
        const result = { totalrecord: 0, totalpage: 0, pagesize: ( body.pagesize | 0) || 10 , currentpage: ( body.currentpage | 0), list: [] };
        const _Query = (sql , params , limit ) => {
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
        if( err ){
            conn.end(); // 结束当前数据库链接
            return res.errorEnd( err , 401 );
        }
        const screen    = body.screen || {};
        let screenStarttime = body.screen.starttime ? parseInt( + new Date( body.screen.starttime ) / 1000 ) : null ;
        let screenEndtime   = body.screen.endtime ? parseInt( + new Date( body.screen.endtime ) / 1000 ) : null ;

        let condition   = ' id > 0 ';
        if( (body.screen.is_refund || 0) > 0 ){ condition += " AND ( refund_payment > 0 ) "; }
        if( (body.screen.is_payment || 0) > 0 ){ condition += " AND ( payment > 0 ) "; }
        if( body.screen.body ){ condition += " AND ( body LIKE '%"+ body.screen.body +"%' OR detail LIKE '%"+ body.screen.body +"%' OR attach LIKE '%"+ body.screen.body +"%' ) "; }
        if( body.screen.openid ){ condition += " AND ( openid = '"+ body.screen.openid +"' ) "; }
        if( body.screen.order ){ condition += " AND ( order LIKE '%"+ body.screen.order +"%' ) "; }
        if( screenStarttime && screenEndtime ){
            if( screenEndtime > screenStarttime ){
                condition += " AND ( time_end <= "+ screenEndtime +" AND time_end >= "+ screenStarttime +" ) ";
            }else{
                condition += " AND ( time_end <= "+ screenEndtime +" ) ";
            }
        }else if( screenStarttime ){
            condition += " AND ( time_end >= "+ screenStarttime +" ) ";
        }else if( screenEndtime ){
            condition += " AND ( time_end <= "+ screenEndtime +" ) ";
        }

        const total  = await _Query("SELECT COUNT(*) AS total FROM ?? WHERE ( "+ condition +" ) LIMIT 1", ['ims_t_we_payment_order'] , 1 );// 获取老板的数据
        if( total.result_error || !total.result_data.total ){
            conn.end(); // 结束当前数据库链接
            return res.successEnd( result );
        }
        result.totalrecord  = total.result_data.total;
        result.totalpage    = Math.ceil( result.totalrecord / result.pagesize );
        result.counter      = { payment: 0, refund_payment: 0 };

        const bill = await _Query("SELECT * FROM ?? WHERE ( "+ condition +" ) ORDER BY `id` DESC LIMIT ?,?", [ 'ims_t_we_payment_order' , result.currentpage , result.pagesize ] );// 获取老板的数据
        if( bill.result_error ){
            conn.end(); // 结束当前数据库链接
            return res.successEnd( result );
        }
        const counter  = await _Query("SELECT SUM(payment) AS payment, SUM(refund_payment) AS refund_payment FROM ?? WHERE ( "+ condition +" ) LIMIT 1", ['ims_t_we_payment_order'] , 1 );// 获取老板的数据
        if( !counter.result_error && counter.result_data ){
            result.counter = counter.result_data;
        }
        conn.end(); // 结束当前数据库链接
        result.list = ( bill.result_data || [] ).map(function(item){
            item.we_order       = that.jsonParse(item.we_order) || [];
            item.refund_body    = that.jsonParse(item.refund_body) || [];
            item.no = typeof item.we_order[0] === 'object' ? item.we_order[0].no : '';
            item.refund_payment = 0;
            for( var index in item.refund_body ){
                item.refund_payment += item.refund_body[index].cash_refund_fee;
            }
            return item;
        });
        return res.successEnd( result );
    });

};