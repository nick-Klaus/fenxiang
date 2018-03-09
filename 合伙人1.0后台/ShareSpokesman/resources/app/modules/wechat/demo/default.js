'use strict';
exports.ready = (req, res, that) => {
    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query || {}; // 当前请求传递过来的 GET 数据,
    const body = req.body || {}; // 当前请求传递过来的 POST 数据
    const sideUrl = req.sideUrl;// 当前域名, 一般为 http://www.zsb2b.com:8081/
    const sideLink = sideUrl + ( req.originalUrl || '' ).slice(1);// 当前域名, 一般为 http://www.zsb2b.com:8081/

    return res.errorEnd( 500 );
    that.connect( {database:'t_diamondsystem'} , async ( err , db , conn ) => {
        var result = [];
        var sql  = "SELECT b.id FROM `bargain` a, `bargain_user` b WHERE ";
            sql += "a.title LIKE '%玫瑰色钻石手镯%' AND a.end_time <= '2017/11/16 18:00:00' AND b.bargain_id = a.id ";
            sql += "AND b.phone_number > '0' AND b.bargain_times <= '9997' AND b.new_price > b.floor_price ORDER BY b.bargain_id DESC";
        db.query( sql , [] , function(err, row, fields) {
            function forEach( index ){
                if( typeof row[ index ] !== 'object' ){
                    conn.end();
                    return res.successEnd( result );
                }
                if( !row[ index ].id ){
                    return forEach( index + 1 );
                }
                db.query( "UPDATE `bargain_user` SET new_price = floor_price WHERE (`id`=?) LIMIT 1" , [ row[ index ].id ] , function(err, row, fields) {
                    result.push( row );
                    forEach( index + 1 );
                })
            }
            forEach( 0 );
        });
    });
}