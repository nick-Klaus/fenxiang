'use strict';
exports.ready = (req, res, that) => {
    console.log( res.cookies )
    if( req.cookies.old_user_token ){
        return res.successEnd( req.cookies.old_user_token );
    }
    res.errorEnd( 'not token' , 500 );
};