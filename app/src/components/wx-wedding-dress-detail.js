var React = require('react');
var PropTypes = React.PropTypes;
var Router = require('react-router-ie8');
var Api = require('../config/api.js');
var SKMap = require('../config/wx-skmap.js');
var ImageListItem = require('./image-item.js');

var WXWeddingDressDetail = React.createClass({
    mixins:[Router.State], //我们需要知道当前的path params 等等信息
    //初始化状态。
    // 分页，资源标示，数据，根路由，总条数， 风格类型
    getInitialState: function() {
        return {
            pageSize:6,
            pageIndex:1,
            tplKey:'list#sample',
            payload:[],
            baseUrl:'',
            totalCount:0
        };
    },
    fetchData:function(url,params){
        return Api.httpGET(url,params);
    },
    loadDetail:function(baseUrl,id,evt){
        //evt.preventDefault();
        var winWidth = $(window).width();

        Api.httpGET(baseUrl+'/'+id,{}).done(function(payload){
            if(payload.code !== 200 || !payload.data) return;

            //console.log(payload.data);
            var pswpElement = document.querySelectorAll('.pswp')[0];
            var mask = 'watermark=1&object=c2h1aXlpbi5wbmc&t=60&p=5&y=10&x=10';

            var items = $.map(payload.data||[],function(v,i){
                var dimension = v.imageUrl && v.imageUrl.split(/_(\d{1,4})x(\d{1,4})\.\w+g$/i);
                var src = (window.Core.mode ==='dev')?v.imageUrl + '@' + mask:v.imageUrl+'@' + winWidth*2 + '90Q|' + mask;
                var w = dimension.length>2 ?parseInt(dimension[1]):-1;
                var h = dimension.length>2 ?parseInt(dimension[2]):-1;
                return {
                    src:src,
                    w:w,
                    h:h
                }
            });

            if(items.length <= 0) items = [{src:'',w:0,h:0}];

            // define options (if needed)
            var options = {
                // optionName: 'option value'
                // for example:
                index: 0, // start at first slide
                history:false,
                focus:false,
                closeEl:false,
                escKey:false,
                closeOnVerticalDrag:false,
                closeOnScroll:false,
                pinchToClose:false
            };

            // Initializes and opens PhotoSwipe
            window.Core.gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
            window.Core.gallery.init();
        });
    },

    componentWillMount : function() {
        window.Core.gallery && window.Core.gallery.close();
    },

    componentDidMount: function() {
        var self = this;
        var url = self.getPath();
        var arr = url.split('/');

        self.loadDetail(arr[1]+'/'+arr[2],arr[3]);
    },

    componentWillUnmount : function(){
        window.Core.gallery.close();
    },

    render: function() {
        return (
            <div className="wedding-dress-detail-view"></div>
        );
    }

});

module.exports = WXWeddingDressDetail;
