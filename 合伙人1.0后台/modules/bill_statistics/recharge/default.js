const mysql  = require('mysql');// Mysql模块
'use strict';
exports.ready = (req, res, that) => {
    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query || {}; // 当前请求传递过来的 GET 数据,
    const body = req.body || {}; // 当前请求传递过来的 POST 数据
    const sideUrl = req.sideUrl;// 当前域名, 一般为 http://www.zsb2b.com:8081/
    const sideLink = sideUrl + ( req.originalUrl || '' ).slice(1);// 当前域名, 一般为 http://www.zsb2b.com:8081/
    const paymentMysql  = { host: 'ilsommo.echao.com', user: 'ilsommo', password: 'ilsommo123', database: 'eboxweixin' };

    const requestKeys   = '93uUkCx6pXEzzWnUhmDC2gDcgawgSyw32tAVkY5vp1tdW0eZiJ';
    if( !body.key || body.key !== requestKeys ){
        return res.errorEnd( '请求无效' , 400 );
    }


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
        const result = { totalrecord: 0, totalpage: 0, pagesize: ( body.pagesize | 0) || 10 , currentpage: ( body.currentpage | 0), list: [] };
        const total  = await _asyncQuery("SELECT COUNT(*) AS total FROM ?? WHERE 1 "+ (createScreen('')) +" LIMIT 1", ['db_manager_recharge', query.manager_id|0 ] , 1 );// 获取老板的数据
        if( total.result_error || !total.result_data.total ){
            conn.end(); // 结束当前数据库链接
            return res.successEnd( result );
        }
        result.totalrecord  = total.result_data.total;
        result.totalpage    = Math.ceil( result.totalrecord / result.pagesize );
        let sql  = 'SELECT b.*, b.id AS recharge_id, a.* FROM ';
            sql += '`db_manager` AS a, `db_manager_recharge` AS b ';
            sql += 'WHERE b.manager_id = a.id '+ (createScreen('b.')) +' ORDER BY b.id DESC LIMIT ?, ?';
        const bill = await _asyncQuery( sql , [ result.currentpage , result.pagesize ] );// 获取老板的数据
        if( bill.result_error ){
            conn.end(); // 结束当前数据库链接
            return res.successEnd( result );
        }
        result.total = total.sql;
        result.sql = bill.sql;
        result.list = bill.result_data || [];
        conn.end(); // 结束当前数据库链接
        return res.successEnd( result , 500 );
    });

    function createScreen( per ){
        let screen = '';
        if( typeof body.screen === 'object' ){
            let startdate   = ( + new Date( body.screen.startdate || '' ) / 1000 );
            let enddate     = ( + new Date( body.screen.enddate || '' ) / 1000 );
            if( startdate && enddate ){
                if( startdate >= enddate ){
                    screen += "AND ( "+ per +"create_time <= "+ enddate +") ";
                }else{
                    screen += "AND ( "+ per +"create_time <= "+ enddate +" AND "+ per +"create_time >= "+ startdate +" ) ";
                }
            }else if( startdate ){
                screen += "AND ( "+ per +"create_time >= "+ startdate +") ";
            }else if( enddate ){
                screen += "AND ( "+ per +"create_time <= "+ enddate +") ";
            }
        }
        return screen;
    }

    // function connect( option ) => {
    //     return new Promise( resolve => {
    //         let opt     = typeof option === 'object' ? option : {};
    //         let pool    = mysql.createPool({
    //             host: opt.host || 'web.echao.com',
    //             user: opt.user || 'admintest',
    //             password: opt.password || 'admintest',
    //             database: opt.database || 'jh_share_spokesman',
    //             port: opt.port || '3306',
    //             waitForConnections: true,// 决定当没有连接池或者链接数打到最大值时pool的行为. 为true时链接会被放入队列中在可用时调用，为false时会立即返回error. (Default: true)
    //             connectionLimit: 10,// 最大连接数. (Default: 10)
    //             dateStrings: true,// 强制日期类型(TIMESTAMP, DATETIME, DATE)以字符串返回，而不是一javascript Date对象返回. (默认: false)
    //             debug: false,// 是否开启调试. (默认: false)
    //             multipleStatements: true,// 是否允许在一个query中传递多个查询语句. (默认: false)
    //         });
    //         pool.getConnection(function(err, connection) {
    //             connection._Query = function(sql , params , limit){
    //                 return new Promise( (resolve, reject) => {
    //                     connection.query( sql , params , function(err, row, fields) {
    //                         this.result_error   = err;
    //                         this.result_base    = row;
    //                         this.result_fields  = fields;
    //                         if( limit == 1 ){
    //                             this.result_data = row ? ( row[0] || {} ) : {};
    //                         }else if( limit >= 1 ){
    //                             this.result_data = row ? ( row.slice( 0 , limit ) ) : {};
    //                         }else{
    //                             this.result_data = row;
    //                         }
    //                         resolve( this );
    //                     });
    //                 });
    //             }
    //             resolve( { error: err , db: connection , conn: pool } );
    //         });
    //     });
    // }
};