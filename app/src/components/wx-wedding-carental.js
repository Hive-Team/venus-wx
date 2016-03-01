var React = require('react');
var PropTypes = React.PropTypes;
var Router = require('react-router-ie8');
var Api = require('../config/api.js');
var SKMap = require('../config/wx-skmap.js');
var ImageListItem = require('./image-item.js');
var WXHeaderMenu = require('./wx-header-menu.js');

var WXWeddingCarRental = React.createClass({
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
            totalCount:0,
            brands:[],
            models:[],
            levels:[],
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
            !obj && (obj = self.state.params);
            self._domControl();
            box.scrollTop(hState.scrollTop);
            window.historyStates.states.push(hState);
            self.scrollPos($("#scroll_box"),$("#scroll_content"),obj);
        });
    },

    componentDidMount: function() {
        var self = this;
        var hState;
        var obj;

        if(window.historyStates.isBack){
            hState = window.historyStates.states.pop();
            self._history(hState);
            window.historyStates.isBack = false;
            return
        }

        self._domControl();

        var parseResource = function(){
            var url = 'car/car_list';

            self.fetchData(url,self.state.params)
                .done(function(payload){
                    (payload && payload.data.length>0 && payload.code === 200) &&
                    self.setState({
                        payload:payload.data,
                        baseUrl:url,
                        totalCount:parseInt(payload.count)
                    },function(){
                        window.historyStates.states.push(self.state);
                    });
                    //console.log(payload.data);
                    //绑上滚动加载。
                    obj = self.state.params;
                    obj.pageIndex ++;
                    self.scrollPos($("#scroll_box"),$("#scroll_content"),obj);

                })
        }

        var brands = function(){
            self.fetchData('carBrand/all')
                .done(function(payload){
                    self.setState({
                        brands:payload.data
                    });
                });
        }
        var models = function(){
            self.fetchData('carModels/all')
                .done(function(payload){
                    self.setState({
                        models:payload.data
                    });
                });
        }
        var levels = function(){
            self.fetchData('carLevel/all')
                .done(function(payload){
                    self.setState({
                        levels:payload.data
                    });
                });
        }

        $.when({})
            .then(brands)
            .then(models)
            .then(levels)
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
                });

                //console.log(payload.data);
                $("#scroll_box").unbind('scroll');
                self.scrollPos($("#scroll_box"),$("#scroll_content"),obj);
            })
    },

    scrollPos:function(box,cont,params){
        var self = this;
        var len = window.historyStates.states.length - 1;

        //console.log(params);
        params.pageIndex ++;
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
                    payload:((params.pageIndex === 1)?payload.data : self.state.payload.concat(payload.data)),
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
        var pageData = self.state.payload;
        var baseUrl = self.state.baseUrl;
        var brands = self.state.brands;
        var models = self.state.models;
        var winW = $(window).width();
        var levels = self.state.levels;

        return (
            <div className="supplies-list-view mobile-main-box">
                <WXHeaderMenu menuType={'menu_8'} name={0} isRender={self.state.isMenuRender} />

                <div className='menu-classify menu-classify-car clearfix'>
                    <span onClick={self.clickFunc.bind(self,{})}>全部</span>
                    <span>品牌</span>
                    <span>型号</span>
                    {
                        //<span>档次</span>
                    }
                    <span>价格</span>
                    <span>类型</span>
                    <ul>
                        {
                            $.map(brands,function(v,i){
                                return(
                                    <li key={i} onClick={self.clickFunc.bind(self,{carBrandId:v.id})}><b>{v.name}</b></li>
                                )
                            })
                        }
                    </ul>
                    <ul>
                        {
                            $.map(models,function(v,i){
                                return(
                                    <li key={i} onClick={self.clickFunc.bind(self,{carModelsId:v.id})}><b>{v.name}</b></li>
                                )
                            })
                        }
                    </ul>
                    {
                        //<ul>
                        //    {
                        //        $.map(levels, function (v, i) {
                        //            return (
                        //                <li key={i} onClick={self.clickFunc.bind(self,{carLevelId:v.id})}>
                        //                    <b>{v.name}</b></li>
                        //            )
                        //        })
                        //    }
                        //</ul>
                    }
                    <ul>
                        <li onClick={self.clickFunc.bind(self,{})}><b>全部价格</b></li>
                        <li onClick={self.clickFunc.bind(self,{priceEnd:999})}><b>1000元以下</b></li>
                        <li onClick={self.clickFunc.bind(self,{priceStart:1000,priceEnd:2000})}><b>1000-2000元</b></li>
                        <li onClick={self.clickFunc.bind(self,{priceStart:2000,priceEnd:3000})}><b>2000-3000元</b></li>
                        <li onClick={self.clickFunc.bind(self,{priceStart:3001})}><b>3000元以上</b></li>
                    </ul>
                    <ul>
                        <li onClick={self.clickFunc.bind(self,{carNature:1})}><b>单车</b></li>
                        <li onClick={self.clickFunc.bind(self,{carNature:2})}><b>车队</b></li>
                    </ul>
                </div>
                
                <div className='scroll-box scroll-padding-100'>
                    <div className='hidden-box'>
                        <div className='scroll-view' id='scroll_box'>
                            <div className='list-view' id='scroll_content'>
                                <ul className="list-7-wxjs clearfix">
                                    {
                                        $.map(pageData,function(v,i){
                                            return(
                                                <li key={i}>
                                                    <div className='hover-box'>
                                                        <ImageListItem
                                                            frameWidth={winW*2}
                                                            url={v.coverUrlWx}
                                                            sid={v.id}
                                                            detailBaseUrl={'car/detail'}
                                                            />
                                                        <h1>{v.title}</h1>
                                                        <div className='price-box'>
                                                            <b><em>￥</em><b>{v.rentalPrice != 0 ? v.rentalPrice.toFixed(2) : '面议'}</b></b>
                                                            <span>{v.marketRentalPrice && v.marketRentalPrice !== v.rentalPrice && v.marketRentalPrice != 0 && '￥' + v.marketRentalPrice.toFixed(2)}</span>
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

module.exports = WXWeddingCarRental;
