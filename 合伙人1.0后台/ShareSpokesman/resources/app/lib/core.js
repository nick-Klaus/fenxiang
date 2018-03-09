// 第三方依赖
const ftp = require('ftp');// FTP模块
const mysql  = require('mysql');// Mysql模块
const moment = require('moment')// 时间处理模块
const path = require("path"); //系统路径模块。
const fs = require('fs');
// const electron = require('electron');
// const IpcRenderer = electron.ipcRenderer;


exports.version = '1.0.1';

/**
 * 判断数据是否为空
 * @param  {[type]}  n      需要判断的值
 * @param  {[type]}  strict 是否严格模式, 默认为严格模式,  非严格模式传入 false
 * @return {Boolean}        [description]
 */
exports.isEmpty = ( n , strict ) => {
    if( strict === false ){
        return ( undefined == n || n == false || n == 0 || null == n || !n || n.length === 0 );
    }
    return ( undefined == n || n === false || n === 0 || null === n || n === '0' || '' === n || n.length === 0 );
}

/**
 * 判断数据类型
 * @param  {[type]} body 需要判断的值
 * @return {[type]}      返回, null , undefined , array 等小写字符串
 */
exports.dataType = ( body , compare ) => {
    var type = Object.prototype.toString.call( body ).slice(8,-1).toLowerCase();
    if( compare !== undefined ){
        return compare === type;
    }
    return type;
}
/**
 * 创建多级目录
 * @param  {[type]}   new_path 目标路径
 * @param  {[type]}   mode     写入类型 一般传入 '0777' 即可
 * @param  {Function} callback 回调, 如果存在回调, 那么该操作为异步, 否则为 同步操作
 * @return {[type]}            [description]
 */
exports.mkDirs = ( new_path , mode , callback ) => {
    var mkdirsSync = (dirname) => {//递归创建目录 同步方法
        if( fs.existsSync(dirname) ){ return true; }
        if( mkdirsSync( path.dirname(dirname) ) ){
            fs.mkdirSync(dirname);
            return true;
        }
    }
    if( "function" === typeof callback ){
        return callback( mkdirsSync( new_path ) ? null : "Directory creation failed" , new_path );
    }
    return mkdirsSync( new_path ) ? new_path : false;
}
/**
 * 解析 JSON 数据
 * @param  {[type]} data 原数据
 * @return {[type]}      解析成功的数据, [ 解析失败时返回 false ]
 */
exports.jsonParse = ( body ) => {
    try{ return JSON.parse( body ); }catch(err){}
    return false;
}
/**
 * 格式化数据为 JSON 格式
 * @param  {[type]} data 原数据
 * @return {[type]}      解析成功的数据, [ 解析失败时返回 原数据 ]
 */
exports.jsonString = ( body ) => {
    if( this.jsonParse(body) === false || "object" === typeof body ){
        return JSON.stringify( body );
    }
    return body;
}

exports.win = {};
exports.win.hide = () => { return require('electron').ipcRenderer.send("window.all.hide"); };
exports.win.closed = () => { return require('electron').ipcRenderer.send("window.all.closed"); };
exports.win.contents = () => { return require('electron').ipcRenderer.send("window.all.contents"); };
exports.win.reload = () => { return require('electron').ipcRenderer.send("window.all.reload"); };
/**
 * 数据库操作
 * @param  {[type]} opt 数据库配置
 * @return {[type]}     [description]
 * 示例:
 * var db = core.connect();
 * db.query("select * from `we_user` where username=:username ", { username: "admin"}, function( err, row, fields ){
 *     console.log( err, row, fields , this.sql );
 *     db.end();
 * })
 */
exports.connect = ( option , callback ) => {
    let cd  = function(){};
    let opt = {};
    if( typeof option === 'function' ){
        cd = option;
    }else if( typeof callback === 'function' ){
        cd = callback;
        if( typeof option === 'object' ){
            opt = option;
        }
    }
    let pool = mysql.createPool({
        host: opt.host || 'web.echao.com',
        user: opt.user || 'admintest',
        password: opt.password || 'admintest',
        database: opt.database || 'jh_share_spokesman',
        port: opt.port || '3306',
        waitForConnections: true,// 决定当没有连接池或者链接数打到最大值时pool的行为. 为true时链接会被放入队列中在可用时调用，为false时会立即返回error. (Default: true)
        connectionLimit: 10,// 最大连接数. (Default: 10)
        dateStrings: true,// 强制日期类型(TIMESTAMP, DATETIME, DATE)以字符串返回，而不是一javascript Date对象返回. (默认: false)
        debug: false,// 是否开启调试. (默认: false)
        multipleStatements: true,// 是否允许在一个query中传递多个查询语句. (默认: false)
    });
    pool.config.queryFormat = function (query, values) {
        if (!values) return query;
        return query.replace(/\:(\w+)/g, function (txt, key) {
            if (values.hasOwnProperty(key)) {
                return this.escape(values[key]);
            }
            return txt;
        }.bind(this));
    };
    pool.getConnection(function(err, connection) {
        if( err ){ return cd( err , connection , pool ); }
        cd( null , connection , pool );
    });
}

// 接收, 系统 console.log(), info(), error(), warn() 方法
exports.console = () => {

    return ;
    let task = [];
    window.console = {
        log: function(){
            taskPush( '  log    ', arguments );
        },
        info: function(){
            taskPush( '  info   ', arguments );
        },
        error: function(){
            taskPush( '  error  ', arguments );
        },
        warn: function(){
            taskPush( '  warn   ', arguments );
        },
    };

    function taskPush( types , argument ){
        let now_second  = moment().format("YYYY-MM-DD HH:mm:ss.SSS");
        var now_times   = + new Date();
        task.push("-------------------------\n");
        for( var index in argument ){
            var content = typeof argument === 'object' ? JSON.stringify( argument[ index ] ) : argument[ index ];
            task.push( '['+ types + '| '+ now_second +'  |  '+ now_times +'  |  '+( index < 9 ? ( '0' + index ) : index )+'  ] : '+ content + "\n" );
        }
    }
    let logs_path   = this.mkDirs( path.join( path.dirname(__dirname) , 'logs' , moment().format("YYYY-MM-DD") ) );
    let writetotal  = 0;
    fs.readdir( logs_path , function(err,files){
        let logo_leng = files.length ? files.length : 1;
        function eachTask(){
            var content = task.shift();
            if( content ){
                writetotal ++;
                if( writetotal >= 200000 ){
                    writetotal = 0;
                    logo_leng += 1;
                }
                fs.appendFileSync( path.join( logs_path , logo_leng + '.log' ) , content , {encoding: 'utf8'} );
                eachTask();
            }
            setTimeout(function(){ eachTask(); }, 30 );
        }
        eachTask();
    });
}

exports.getIPAdress = () => {
    var interfaces = require('os').networkInterfaces();
    for(var devName in interfaces){
          var iface = interfaces[devName];
          for(var i=0;i<iface.length;i++){
               var alias = iface[i];
               if(alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal){
                     return alias.address;
               }
          }
    }
    return null;
}

// 加
exports.floatAdd = ( arg1 , arg2 ) => {
    var r1,r2,m;
    try{r1=arg1.toString().split(".")[1].length}catch(e){r1=0}
    try{r2=arg2.toString().split(".")[1].length}catch(e){r2=0}
    m=Math.pow(10,Math.max(r1,r2));
    return (arg1*m+arg2*m)/m;
}

// 减
exports.floatSub = ( arg1 , arg2 ) => {
    return exports.floatAdd( arg1 , -arg2 );
}

// 乘
exports.floatMul = ( arg1 , arg2 ) => {
    var m=0,s1=arg1.toString(),s2=arg2.toString();
    try{m+=s1.split(".")[1].length}catch(e){}
    try{m+=s2.split(".")[1].length}catch(e){}
    return Number(s1.replace(".",""))*Number(s2.replace(".",""))/Math.pow(10,m);
}

// 除
exports.floatDiv = ( arg1 , arg2 ) => {
    var t1=0,t2=0,r1,r2;
    try{t1=arg1.toString().split(".")[1].length}catch(e){}
    try{t2=arg2.toString().split(".")[1].length}catch(e){}
    return (Number(arg1.toString().replace(".",""))/Number(arg2.toString().replace(".","")))*Math.pow(10,t2-t1);
}