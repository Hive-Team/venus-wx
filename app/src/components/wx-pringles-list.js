var React = require('react');
var PropTypes = React.PropTypes;
var Router = require('react-router-ie8');
var Api = require('../config/api.js');
var SKMap = require('../config/wx-skmap.js');
var ImageListItem = require('./image-item.js');
var WXHeaderMenu = require('./wx-header-menu.js');

var WXPringlesList = React.createClass({
    mixins:[Router.State], //我们需要知道当前的path params 等等信息
    //初始化状态。
    // 分页，资源标示，数据，根路由，总条数， 风格类型
    getInitialState: function() {
        return {
            pageSize:6,
            pageIndex:1,
            tplKey:'list#pringles',
            payload:[],
            baseUrl:'',
            quarterly:[],
            recommend:'',
            listUrl:'',
            totalCount:0
        };
    },
    //取数据
    fetchData:function(url,params){
        return Api.httpGET(url,params);
    },

    componentDidMount: function() {
        var self = this;
        var $style_box = $('#style_box');
        var $btn_style = $('#btn_style');
        var isStyleMenu = false;

        $btn_style.on('click',function(){
            if(!isStyleMenu){
                isStyleMenu = !isStyleMenu;
                $style_box.css({display:'block'});
            }else{
                isStyleMenu = !isStyleMenu;
                $style_box.css({display:'none'})
            }
        });

        $style_box.on('click','li',function(){
            isStyleMenu = !isStyleMenu;
            $style_box.css({display:'none'});
        });

        // 从菜单获取资源链接。
        var parseResource = function(){
            var pathArr = SKMap['#'+self.getPathname()].split('/');
            var resourceLinks = window.Core.resource;

            $.each(pathArr,function(k,v){
                resourceLinks = resourceLinks[v];
            });

            self.state.listUrl = resourceLinks['分季欣赏'].split('#')[1];
            self.state.recommend = resourceLinks['最佳客片'].split('#')[1];

            self.fetchData(self.state.recommend,
                {
                    pageSize:self.state.pageSize,
                    pageIndex:self.state.pageIndex
                })
                .done(function(payload){
                    (payload.data && payload.code === 200) &&
                    self.setState({
                        payload:((self.state.pageIndex === 1)?payload.data : self.state.payload.concat(payload.data)),
                        pageIndex:parseInt(self.state.pageIndex)+1,
                        baseUrl:self.state.recommend,
                        totalCount:parseInt(payload.totalCount)
                    });

                    //console.log(payload.totalCount);
                    // 绑上滚动加载。
                    self.scrollPos($("#scroll_box"),$("#scroll_content"),
                        {
                            pageSize:self.state.pageSize,
                            pageIndex:self.state.pageIndex
                        }
                    );
                });

            self.fetchData('condition/season')
                .done(function(payload){
                    (payload.data && payload.code === 200) &&
                    self.setState({
                        quarterly:payload.data
                    });
                    //console.log(payload.data);
                });
        };

        $.when(window.Core.promises['/'])
            //.then(fetchStyle)
            .then(parseResource);
    },

    selSeason : function(obj){
        var self = this;
        var num = 0;
        var params = {
            pageSize:6,
            pageIndex:1
        }
        for(var i in obj) num ++;
        var url = num<1 ? self.state.recommend : self.state.listUrl;

        self.state.pageIndex = 1;
        $.extend(obj,params);

        self.fetchData(url,obj)
            .done(function(payload){
                (payload.data && payload.code===200)&&
                self.setState({
                    pageIndex:parseInt(self.state.pageIndex)+1,
                    payload:payload.data,
                    baseUrl:url,
                    totalCount:payload.totalCount
                })
                //console.log(payload.totalCount);
                obj.pageIndex ++;
                $("#scroll_box").unbind('scroll');
                self.scrollPos($("#scroll_box"),$("#scroll_content"),obj);
            })
    },

    scrollFunc:function(url,params) {
        var self = this;

        if(parseInt(self.state.totalCount)>0 &&
            parseInt(self.state.pageSize)*parseInt(self.state.pageIndex - 1) >parseInt(self.state.totalCount))
            return;

        $('#loaderIndicator').addClass('isShow');
        window.Core.isFeching = true;
        var timeout = window.setTimeout(function(){
            window.Core.isFeching = false;
        },5000);

        self.fetchData(url,params)
            .done(function(payload){
                //console.log(payload.data);
                (payload.data && payload.code === 200) &&
                self.setState({
                    payload:((self.state.pageIndex === 1)?payload.data : self.state.payload.concat(payload.data)),
                    pageIndex:parseInt(self.state.pageIndex)+1
                });
                window.Core.isFeching = false;
                window.clearTimeout(timeout);
                $('#loaderIndicator').removeClass('isShow');
            })
    },

    scrollPos:function(box,cont,params){
        var self = this;

        box.bind("scroll",function(){
            if(box.scrollTop() + box.height() >= cont.height() && !window.Core.isFeching){
                self.scrollFunc(self.state.baseUrl,params);
                params.pageIndex = params.pageIndex + 1;
                //console.log(params.pageIndex);
                //$('#loaderIndicator').addClass('isShow');
            }
        });
    },

    render : function() {
        var self = this;
        var winW = $(window).width();
        var pageData = self.state.payload || [];
        var quarterly = self.state.quarterly || [];
        var baseUrl = self.state.baseUrl;

        return (
            <div className="app has-navbar-top">
                <WXHeaderMenu menuType={'menu_1'} name={1} />

                <div className="screening-box-wx">
                    <ul className="screening-list-wx" id="style_box">
                        <li onClick={self.selSeason.bind(self,{})}>{'最佳客片'}</li>
                        {
                            $.map(quarterly || [],function(v,i){
                                return (
                                    <li key={i} onClick={self.selSeason.bind(self,{seasonId:v.seasonId})}>{v.seasonName}</li>
                                )
                            })
                        }
                    </ul>
                    <div className="btn-box-wx" id="btn_style">
                        <span className="btn-wx">分季</span>
                    </div>
                </div>
                <div className="app-body">
                    <div className="app-content">
                        <div className="app-content-loading">
                            <i className="fa fa-spin loading-spinner" />
                        </div>
                        <div className="scroll-able">
                            <div className="scroll-able-content" id="scroll_box">
                                <div className="list-group list-box" id="scroll_content">
                                    <ul className="list-1-wxjs clearfix">
                                        {
                                            $.map(pageData,function(v,i){
                                                return (
                                                    <li key={i}>
                                                        <ImageListItem
                                                            frameWidth={winW*2}
                                                            url={v.contentUrl}
                                                            sid={v.contentId}
                                                            detailBaseUrl={baseUrl}
                                                            />
                                                        <div className="title">
                                                            <span className="cn" >{v.contentName.split(/\s(.+)?/)[0]}</span>
                                                            <span className="en">{v.contentName.split(/\s(.+)?/)[1]}</span>
                                                        </div>
                                                    </li>
                                                )
                                            })
                                        }

                                    </ul>
                                    <div id="loaderIndicator" className="btn-more"><span id="loading-info">正在加载... ...</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        );
    }

});

module.exports = WXPringlesList;
