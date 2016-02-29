var React = require('react');
var PropTypes = React.PropTypes;
var Router = require('react-router-ie8');
var Api = require('../config/api.js');
var SKMap = require('../config/wx-skmap.js');
var ImageListItem = require('./image-item.js');
var WXHeaderMenu = require('./wx-header-menu.js');

var WXWeddingSupplies = React.createClass({
    mixins:[Router.State], //我们需要知道当前的path params 等等信息
    //初始化状态。
    // 分页，资源标示，数据，根路由，总条数， 风格类型
    getInitialState: function() {
        var self = this;

        return {
            params:{
                pageSize:6,
                pageIndex:1
            },
            payload:[],
            sliderData:[],
            baseUrl:'',
            brand:[],
            types:[],
            totalCount:0,
            scrollTop:0,
            currentCard:0,
            itemCurrentCard:null,
            isMenuRender:true
        };
    },

    //取数据
    fetchData:function(url,params){
        return Api.httpGET(url,params);
    },

    _domControl : function(){
        var self = this;
        var $menu_classify = $('.menu-classify');
        var B_ul = false;

        if(self.state.itemCurrentCard != null){
            $('li',$menu_classify).eq(self.state.itemCurrentCard).addClass('li-current');
        }

        $('span',$menu_classify).eq(self.state.currentCard).addClass('item-current');
        $menu_classify.on('click','span',function(){
            var ind = $(this).index();

            if($(this).hasClass('item-current') && B_ul){
                $('ul',$menu_classify).removeAttr('style');
                B_ul = false;
                return;
            }

            B_ul = true;

            $(this).addClass('item-current');
            $(this).siblings().removeClass('item-current');
            $('ul',$menu_classify).eq(ind - 1).css({display:'block'})
                .siblings().removeAttr('style');

            ind <= 0 && $('ul',$menu_classify).removeAttr('style');
        });

        $menu_classify.on('click','li',function(){
            $(this).parent().removeAttr('style');
            $('li',$menu_classify).removeAttr('class');
            $(this).addClass('li-current');
            B_ul = false;
        });
    },

    componentWillMount : function(){
        var self = this;

        window.historyStates.isBack === true &&
        (self.state.isMenuRender = false);
    },

    _history : function(hState,obj){
        var self = this;
        var box = $("#scroll_box");

        self.setState(hState,function(){
            !obj && (obj = {pageIndex:self.state.pageSize,pageSize:self.state.pageSize});
            self._domControl();
            box.scrollTop(hState.scrollTop);
            window.historyStates.states.push(hState);
            self.scrollPos($("#scroll_box"),$("#scroll_content"));
        });
    },

    componentDidMount: function() {
        var self = this;
        var hState;

        if(window.historyStates.isBack){
            hState = window.historyStates.states.pop();
            self._history(hState);
            window.historyStates.isBack = false;
            return
        }

        self._domControl();

        var parseResource = function(){
            var url = 'weddingsupplies/supplies_list';

            self.fetchData(url,self.state.params)
                .done(function(payload){
                    (payload.data && payload.data.length>0 && payload.code === 200) &&
                    self.setState({
                        payload:payload.data,
                        totalCount:parseInt(payload.count),
                        baseUrl:url
                    },function(){
                        window.historyStates.states.push(self.state);
                    });
                    //console.log(payload.data);
                    //绑上滚动加载。
                    //console.log(self.state.params);
                    self.scrollPos($("#scroll_box"),$("#scroll_content"),self.state.params);
                })
        };

        var brand = function(){
            self.fetchData('suppliesBrand/all')
                .done(function(payload){
                    self.setState({
                        brand:payload.data
                    });
                });
        }

        var types = function(){
            self.fetchData('suppliesType/all')
                .done(function(payload){
                    self.setState({
                        types:payload.data
                    });
                });
        }

        $.when({})
            .then(brand)
            .then(types)
            .then(parseResource);
    },

    clickFunc : function(obj){
        var self = this;
        var $menu_classify = $('.menu-classify');
        var len = window.historyStates.states.length - 1;
        var currentCard,itemCurrentCard;

        self.state.params.pageIndex = 1;
        $.extend(obj,self.state.params);

        $('span',$menu_classify).each(function(i,e){
            if($(this).hasClass('item-current')) currentCard = i;
        });

        $('li',$menu_classify).each(function(i,e){
            $(this).hasClass('li-current') === true && (itemCurrentCard = i);
        });

        console.log(currentCard,itemCurrentCard);

        self.fetchData(self.state.baseUrl,obj)
            .done(function(payload){
                (payload.data && payload.code===200)&&
                self.setState({
                    payload:payload.data,
                    totalCount:payload.count,
                    currentCard:currentCard,
                    itemCurrentCard:itemCurrentCard,
                    isMenuRender:false
                },function(){
                    window.historyStates.states[len] = self.state;
                })

                $("#scroll_box").unbind('scroll');
                self.scrollPos($("#scroll_box"),$("#scroll_content"),obj);
            })
    },

    scrollPos:function(box,cont,params){
        var self = this;
        var len = window.historyStates.states.length - 1;

        box.bind("scroll",function(){
            if(box.scrollTop() + box.height() >= cont.height() && !window.isFeching){
                self.scrollFunc(self.state.baseUrl,params);
                params.pageIndex ++;
            }

            self.state.scrollTop = box.scrollTop();
            self.state.isMenuRender = false;

            window.historyStates.states[len].scrollTop = box.scrollTop();
        });
    },

    scrollFunc:function(url,params) {
        var self = this;
        var len = window.historyStates.states.length - 1;

        if(parseInt(self.state.totalCount)>0 &&
            parseInt(params.pageSize)*parseInt(params.pageIndex - 1) >parseInt(self.state.totalCount))
            return;

        $('#loaderIndicator').addClass('isShow');
        window.isFeching = true;
        var timeout = window.setTimeout(function(){
            window.isFeching = false;
        },5000);

        self.fetchData(url,params)
            .done(function(payload){
                (payload.data && payload.code === 200) &&
                self.setState({
                    payload:((self.state.pageIndex === 1)?payload.data : self.state.payload.concat(payload.data)),
                    params:{
                        pageIndex:parseInt(self.state.pageIndex)+1,
                        pageSize:6
                    },
                    isMenuRender:false
                },function(){
                    window.historyStates.states[len] = self.state;
                });
                window.isFeching = false;
                window.clearTimeout(timeout);
                $('#loaderIndicator').removeClass('isShow');
            })

    },

    render: function(){
        var self = this;
        var winW = $(window).width();
        var pageData = self.state.payload;
        var type = self.state.typeArr;
        var baseUrl = self.state.baseUrl;
        var brand = self.state.brand;          //品牌
        var types = self.state.types;

        return (
            <div className="supplies-list-view mobile-main-box">
                <WXHeaderMenu menuType={'menu_7'} name={0} isRender={self.state.isMenuRender} />

                <div className='menu-classify clearfix' id='supplies_menu'>
                    <div className='pos-box'>
                        <span onClick={self.clickFunc.bind(self,{})}>全部</span>
                        <span>品牌</span>
                        <span>类型</span>
                        <ul>
                            {
                                $.map([{name:'暂无'}],function(v,i){
                                    return(
                                        <li key={i} onClick={self.clickFunc.bind(self,{weddingSuppliesTypeId:v.id})}><b>{v.name}</b></li>
                                    )
                                })
                            }
                        </ul>
                        <ul>
                            {
                                $.map(types,function(v,i){
                                    return(
                                        <li key={i} onClick={self.clickFunc.bind(self,{weddingSuppliesTypeId:v.id})}><b>{v.name}</b></li>
                                    )
                                })
                            }
                        </ul>
                    </div>
                </div>

                <div className='scroll-box scroll-padding-100'>
                    <div className='hidden-box'>
                        <div className='scroll-view' id='scroll_box'>
                            <div className='list-view' id='scroll_content'>
                                <ul className="list-7-wxjs clearfix">
                                    {
                                        $.map(pageData || [],function(v,i){
                                            return(
                                                <li key={i}>
                                                    <div className='hover-box'>
                                                        <ImageListItem
                                                            frameWidth={winW*2}
                                                            url={v.coverUrlWx}
                                                            sid={v.id}
                                                            detailBaseUrl={'weddingsupplies/detail'}
                                                            />
                                                        <h1>{v.title}</h1>
                                                        <div className='price-box'>
                                                            <b><em>￥</em><b>{v.sellingPrice != 0 && v.sellingPrice.toFixed(2)}</b></b>
                                                            <span>{v.marketPrice && v.marketPrice != 0 && v.marketPrice !== v.sellingPrice && '￥' + v.marketPrice.toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                </li>
                                            )
                                        })
                                    }
                                </ul>
                            </div>
                            <div id="loaderIndicator" className="btn-more"><span id="loading-info">正在加载... ...</span></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = WXWeddingSupplies;
