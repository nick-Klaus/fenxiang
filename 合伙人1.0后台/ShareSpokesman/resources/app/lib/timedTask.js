let that = null;
let task = [];
const moment = require('moment')// 时间处理模块
const request = require('request');

exports.config = ( _that ) => {
    that = _that;
}

exports.getAll = ( callback ) => {
    that.connect( async ( err , db , conn ) => {
        const _asyncQuery = (sql , params , limit ) => {
            return  new Promise( resolve => {
                db.query( sql , params , function(err, row, fields) {
                    let rows = null;
                    if( limit == 1 ){
                        rows = row ? ( row[0] || {} ) : {};
                    }else if( limit >= 1 ){
                        rows = row ? ( row.slice( 0 , limit ) ) : {};
                    }else{
                        rows = row;
                    }
                    resolve( { err: err , row: rows , fields: fields , that: this } );
                });
            })
        }
        const database = await _asyncQuery("select * from ?? where `id` ", ['db_daily_execution']);// 获取老板的数据
        conn.end(); // 结束当前数据库链接
        task = database.row || [];
        return callback( database.err , database.row , database );
    });
}

exports.trigger = ( callback ) => {
    let now_time = moment();
    let now_format = now_time.format("YYYY-MM-DD HH:mm:ss");
    // console.log( now_format );
    task.filter( ( vals , index ) => {
        if( vals.types == 0 || vals.types == 1 ){ // 每分钟 // 每小时
            if( !vals.trigger_date ){
                // 直接运行
                task[index].trigger_date = now_format;
                vals.trigger_date = now_format;
                console.log( '直接运行' );
                RequestImplement( vals.implement_url , vals );// 运行
            }else{
                let maxs_format = vals.types == 0 ? 60 : 24;
                let diff_format = vals.types == 0 ? 'minute' : 'hours';
                let run_date = ( vals.run_date > maxs_format ? maxs_format : ( vals.run_date < 0 ? null : (vals.run_date|0) ) );
                if( run_date !== null ){
                    let diff = now_time.diff( moment('2017-08-16 14:18:17') , diff_format );
                    if( diff >= run_date ){
                        task[index].trigger_date = now_format;
                        vals.trigger_date = now_format;
                        console.log( '运行' , diff_format );
                        RequestImplement( vals.implement_url , vals );// 运行
                    }
                }
            }
        }else if( vals.types == 2 ){// 每天
            let format = now_time.format("HH:mm");
            if( vals.run_date == format ){
                task[index].trigger_date = now_format;
                vals.trigger_date = now_format;
                console.log( '运行' , 'days' );
                RequestImplement( vals.implement_url , vals );// 运行
            }
        }else if( vals.types == 3 ){// 某天, 每个月的某一天,
            let format  = moment().format("MM-DD");
            let trigger = moment( vals.trigger_date ).format("MM-DD");//.split('-');
            if( format != trigger && ( !vals.trigger_date || format.slice(3) == trigger.slice(3) ) ){
                task[index].trigger_date = now_format;
                vals.trigger_date = now_format;
                console.log( '运行' , 'monthly' );
                RequestImplement( vals.implement_url , vals );// 运行
            }
        }
    });
    function RequestImplement( url , vals ){
        request( url , function (error, response, body) {
            console.log( "RequestImplement" , url , response.statusCode + ' : '+ response.statusMessage )
        });
        let update = { trigger_date: vals.trigger_date || '' };
        that.connect( async ( err , db , conn ) => {
            db.query( "UPDATE ?? SET ? WHERE `id`=? LIMIT 1" , ['db_daily_execution', update, vals.id ] , function(err, row, fields) {
                console.log( this.sql );
            });
        });
    }
}