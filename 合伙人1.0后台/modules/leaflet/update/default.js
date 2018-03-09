/**
 * Created by Administrator on 2017/8/13.
 * 传单活动 修改
 */
'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据
    if(that.isEmpty(req.session.user_token)){
        return res.errorEnd('当前请求不存在 Token 或 Token 不可用1', 300);
    }
    var user = req.session.user_rows;
    if(  that.isEmpty(body.id) ){
        return res.errorEnd('条件不能为空', 200);
    }
    that.connect(( err , db , conn ) => {
        // 更新数据
        var leaflet_arr = {
            "image_logo":body.image_logo,
            "banner_top":body.banner_top,
            "title":body.title,
            "start_time":body.start_time,
            "end_time":body.end_time,
            "floor_price":body.floor_price,
            "original_price":body.original_price,
            "product_quantity":body.product_quantity,
            "product_introduction_img":body.product_introduction_img,
            "product_introduction":body.product_introduction,
            "activity_rules":body.activity_rules,
            "award_information":body.award_information,
            "company_introduction":body.company_introduction,
            "company_introduction_img":body.company_introduction_img,
            "contact_img":body.contact_img,
            "start_up_money_all":body.start_up_money_all,
            "start_up_money_residue":body.start_up_money_all,
            "share_money_time":body.share_money_time,
            "forward_money_time":body.forward_money_time,
            "browse_money_time":body.browse_money_time,
            "product_id":body.product_id
        }
        db.query( "UPDATE `db_leaflet` SET ? where id=? " , [ leaflet_arr ,body.id ] , function( err, result , fields ){
            var total = result.changedRows ; // 受影响的数据条数, ( 已删除的数据条数 )
            if( err ){
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('更新数据失败!!', 200);
            }
            if( !total ){
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('没有操作数据!!', 200);
            }
            db.release(); // 释放资源
            conn.end(); // 结束当前数据库链接
            return res.successEnd( '成功更新数据 : '+ total );
        });
    });
}
