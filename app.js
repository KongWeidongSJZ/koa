var Koa=require('koa'),
    app=new Koa(),
    router=require('./app/router/router'),
    bodyPaser=require('koa-bodyparser'),
    sequelize = require('./app//db/sequelize-connection'),
    UserModel=require('./app/db/UserModel'),
    CONFIG=require('./config');
app.use(async (ctx,next)=>{
    ctx.appConfig=CONFIG;
    ctx.set('Access-Control-Allow-Origin',CONFIG.AccessControlAllowOrigin);
    ctx.set('Access-Control-Allow-Methods',CONFIG.AccessControlAllowMethods);
    await next()
});
app.use(bodyPaser({
    enableTypes:CONFIG.REQUEST_TYPE,
    onerror: function (err, ctx) {
        ctx.throw('body parse error', 422);
    }
}));
app.use(function(ctx ,next){
    ctx.request.body=typeof ctx.request.body=='string'?JSON.parse(ctx.request.body):ctx.request.body;
    return next()
});
app.use(async (ctx,next)=>{
    if(ctx.path=='/create'){
        sequelize.import('user',UserModel);
        await sequelize.sync({force:true}).then(()=>{
            ctx.body='success'
        }).catch(()=>{
            ctx.body='fail'
        });
    }
    sequelize.import('user',UserModel);
    ctx.sequelize=sequelize;
    return next()
});
app.use(router.routes());
app.use(router.allowedMethods());
app.listen(3005,function(err){
    if(err){
        console.log(err);
        return
    }
    console.log('3005 success')
});
