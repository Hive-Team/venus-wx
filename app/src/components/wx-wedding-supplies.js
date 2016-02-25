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
            totalCount:0
        };
    },
    //取数据
    fetchData:function(url,params){
        return Api.httpGET(url,params);
    },
    componentDidMount: function() {
        var self = this;
        var $menu_classify = $('.menu-classify');
        var B_ul = false;

        $('span',$menu_classify).eq(0).addClass('item-current');
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

        var parseResource = function(){
            var url = 'weddingsupplies/supplies_list';
            self.fetchData(url,self.state.params)
                .done(function(payload){
                    (payload.data && payload.data.length>0 && payload.code === 200) &&
                    self.setState({
                        payload:payload.data,
                        totalCount:parseInt(payload.count)
                    });
                    self.setState({baseUrl:url});
                    //console.log(payload.data);
                    //绑上滚动加载。
                    self.scrollPos($("#scroll_box"),$("#scroll_content"),self.state.params);

                })
        };

        var brand = function(){
            self.fetchData('weddingsupplies/brands')
                .done(function(payload){
                    self.setState({
                        brand:payload.data
                    });
                });
        }
        var types = function(){
            self.fetchData('weddingsupplies/types')
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

        self.state.params.pageIndex = 1;
        $.extend(obj,self.state.params);

        self.fetchData(self.state.baseUrl,obj)
            .done(function(payload){
                (payload.data && payload.code===200)&&
                self.setState({
                    payload:payload.data,
                    totalCount:payload.count
                })

                $("#scroll_box").unbind('scroll');
                self.scrollPos($("#scroll_box"),$("#scroll_content"),obj);
            })
    },

    scrollPos:function(box,cont,params){
        var self = this;

        params.pageIndex ++;
        box.bind("scroll",function(){
            if(box.scrollTop() + box.height() >= cont.height() && !window.isFeching){
                self.scrollFunc(self.state.baseUrl,params);
                params.pageIndex ++;
            }
        });
    },

    scrollFunc:function(url,params) {
        var self = this;

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
                    pageIndex:parseInt(self.state.pageIndex)+1
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
                <WXHeaderMenu menuType={'menu_7'} name={0} />

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
