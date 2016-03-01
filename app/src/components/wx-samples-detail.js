var React = require('react');
var PropTypes = React.PropTypes;
var Router = require('react-router-ie8');
var Api = require('../config/api.js');
var SKMap = require('../config/wx-skmap.js');
var ImageListItem = require('./image-item.js');

var WXSampleDetail = React.createClass({
    mixins:[Router.State], //我们需要知道当前的path params 等等信息
    //初始化状态。
    // 分页，资源标示，数据，根路由，总条数， 风格类型
    getInitialState: function() {
        return {
            pageSize:6,
            pageIndex:1,
            payload:[],
            baseUrl:'',
            totalCount:0,
            currentCard:0,
            scrollTop:0,
            isMenuRender:true
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
            var pswpElement = document.querySelectorAll('.pswp')[0];
            var imgUrls = JSON.parse(payload.data.wxDetailImages) || [];

            var items = $.map(imgUrls,function(v,i){
                //console.log(v);
                var dimension = v && v.split(/_(\d{1,4})x(\d{1,4})\.\w+g$/i);
                var src = v + '@watermark=1&object=c2h1aXlpbi5wbmc&t=60&p=5&y=10&x=10';
                var w = dimension.length>2 ?parseInt(dimension[1]):-1;
                var h = dimension.length>2 ?parseInt(dimension[2]):-1;
                return {
                    src:src,
                    w:w,
                    h:h
                }
            })

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
            window.gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
            window.gallery.init();
        });

    },

    _clickBack : function(){
        var last;
        var $glob_back = $('#glob_detail_back');

        window.historyStates.isBack = true;
        last = window.historyStates.states.length - 1;
        window.historyStates.states[last].isMenuRender = true;
        $glob_back.off('click');

        window.history.back();
    },

    componentDidMount: function() {
        var self = this;
        var url = self.getPath();
        var arr = url.split('/');
        var $glob_back = $('#glob_detail_back');

        window.historyStates.states.length >= 1 && $glob_back.css({display:'block'});
        $glob_back.on('click',function(){
            self._clickBack();
        });

        self.loadDetail(arr[1] + '/' + arr[2],arr[3]);
    },

    componentWillUnmount : function(){
        window.gallery.close();
    },

    render: function() {
        return (
            <div className="samples-detail-view"></div>
        );
    }

});

module.exports = WXSampleDetail;
