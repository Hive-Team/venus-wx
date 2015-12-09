var express=require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    path = require('path'),
    favicon = require('serve-favicon');

    app.use(function(req, res, next) {
        next();
    });
    app.use(express.static('./app'));
    // app.use(favicon(__dirname+'/dist/favicon.ico'));
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
// mainModuleJSON
var apiRouter = express.Router();



apiRouter.get('/:module/:category',function(req,res,next){
    //console.log(req.params);
    //console.log(req.query);
    if (req.params.category === '10021') {
        res.json(require('./app/test/'+req.params.module + req.params.category+req.query.pageSize*req.query.pageIndex+'.json'));
    }

    res.json(require('./app/test/'+req.params.module + req.params.category+'.json'));
    next();
});

apiRouter.get('/:module/:category/:contentId',function(req,res,next){
    //console.log(req.params);
    res.json(require('./app/test/'+req.params.module + req.params.category +req.params.contentId+'.json'));
    next();
});

app.use('/api',apiRouter);



app.listen(8888);
