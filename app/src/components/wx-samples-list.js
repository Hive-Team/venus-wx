var React = require('react');
var PropTypes = React.PropTypes;
var Router = require('react-router-ie8');
var Api = require('../config/api.js');
var SKMap = require('../config/wx-skmap.js');
var ImageListItem = require('./image-item.js');
var WXHeaderMenu = require('./wx-header-menu.js');
//var WXScreening = require('./wx-screening.js');

var WXSampleList = React.createClass({
    mixins:[Router.State], //我们需要知道当前的path params 等等信息
    //初始化状态。
    // 分页，资源标示，数据，根路由，总条数， 风格类型
    getInitialState: function() {
        return {
            pageSize:6,
            pageIndex:1,
            sampleType:0,
            payload:[],
            baseUrl:'',
            totalCount:0,
            stylesList:[],
            addressList:[],
            currentCard:0,
            scrollTop:0,
            isMenuRender:true
        }
    },

    _domControl : function(){
        var self = this;
        var $style_box = $('#style_box');
        var $btn_style = $('#btn_style');
        var $address_box = $('#address_box');
        var $btn_address = $('#btn_address');
        var isStyleMenu = false;
        var isAddressMenu = false;
        var $menu_classify = $('.menu-classify');

        $('span',$menu_classify).eq(self.state.currentCard).addClass('item-current');
        $menu_classify.on('click','span',function(){
            var ind = $(this).index();

            $(this).addClass('item-current');
            $(this).siblings().removeClass('item-current');
            $('ul',$menu_classify).eq(ind - 1).css({display:'block'})
                .siblings().removeAttr('style');

            if(ind <= 0){
                $('ul',$menu_classify).removeAttr('style');
            }

            ind === 1 && $('.samples-view .screening-box-wx').css({display:'none'}) || $('.samples-view .screening-box-wx').css({display:'block'})
            self.setState({currentCard:ind,isMenuRender:false});
        });

        $btn_style.on('click',function(){
            if(!isStyleMenu){
                isStyleMenu = !isStyleMenu;
                $style_box.css({display:'block'});
                isAddressMenu = false;
                $address_box.css({display:'none'})
            }else{
                isStyleMenu = !isStyleMenu;
                $style_box.css({display:'none'})
            }
        });

        $style_box.on('click','li',function(){
            isStyleMenu = !isStyleMenu;
            $style_box.css({display:'none'});
            $(this).addClass('current').siblings().removeClass('current');
            $('li',$address_box).removeClass('current');
        });

        $btn_address.on('click',function(){
            if(!isAddressMenu){
                isAddressMenu = !isAddressMenu;
                $address_box.css({display:'block'});
                isStyleMenu = false;
                $style_box.css({display:'none'})
            }else{
                isAddressMenu = !isAddressMenu;
                $address_box.css({display:'none'})
            }
        });

        $address_box.on('click','li',function(){
            isAddressMenu = !isAddressMenu;
            $address_box.css({display:'none'});
            $(this).addClass('current').siblings().removeClass('current');
            $('li',$style_box).removeClass('current');
        });
    },

    _history : function(hState,obj){
        var self = this;
        var box = $("#scroll_box");

        self.setState(hState,function(){
            !obj && (obj = {pageIndex:self.state.pageSize,pageSize:self.state.pageSize});
            self._domControl();
            box.scrollTop(hState.scrollTop);
            window.historyStates.states.push(hState);
            self.scrollPos(box,$("#scroll_content"),obj);
        });
    },

    componentDidMount : function() {
        var self = this;
        var hState;
        console.log(new ImageListItem());

        if(window.historyStates.isBack){
            hState = window.historyStates.states.pop();
            self._history(hState);
            window.historyStates.isBack = false;
            return
        }

        self._domControl();

        //console.log(window.historyStates.states.length);
        //var len = window.historyStates.states.length - 1 < 0 ? 0 : window.historyStates.states.length - 1;

        // 从菜单获取资源链接。
        var parseResource = function(){
            self.fetchData('sample/samples_list',
                {
                    pageSize:self.state.pageSize,
                    pageIndex:self.state.pageIndex,
                    sampleType:self.state.sampleType
                })
                .done(function(payload){
                    (payload.data && payload.code === 200) &&
                    self.setState({
                        payload:((self.state.pageIndex === 1)?payload.data : self.state.payload.concat(payload.data)),
                        pageIndex:parseInt(self.state.pageIndex)+1,
                        totalCount:parseInt(payload.count),
                        baseUrl:'sample/samples_list',
                    },function(){
                        //console.log(window.historyStates.states.length,window.historyStates.states);
                        window.historyStates.states.push(self.state);
                        //console.log(window.historyStates.states.length,window.historyStates.states);
                    });

                    //console.log(JSON.stringify(payload.data,null,4))
                    // 绑上滚动加载。
                    self.scrollPos($("#scroll_box"),$("#scroll_content"),
                        {
                            pageSize:self.state.pageSize,
                            pageIndex:self.state.pageIndex
                        }
                    );
                })
        };

        var fetchStyle = function(){
            Api.httpGET('shootStyle/all',{})
                .done(function(payload){
                    //console.log(payload.data);
                    (payload.data && payload.code === 200) &&
                    self.setState({
                        stylesList:payload.data
                    })
                });
        };

        var fetchExterior = function(){
            Api.httpGET('exterior/all',{})
                .done(function(payload){
                    //console.log(payload.data);
                    (payload.data && payload.code === 200) &&
                    self.setState({
                        addressList:payload.data
                    })
                });
        };

        $.when({})
            .then(fetchExterior)
            .then(fetchStyle)
            .then(parseResource)

    },

    //取数据
    fetchData : function(url,params){
        return Api.httpGET(url,params);
    },

    screeningFunc : function(obj){
        var self = this;
        var len = window.historyStates.states.length - 1;
        var params = {
            pageSize:6,
            pageIndex:1
        }

        self.state.pageIndex = 1;
        $.extend(obj,params);

        self.fetchData(self.state.baseUrl,obj)
            .done(function(payload){
                (payload.data && payload.code===200)&&
                self.setState({
                    pageIndex:parseInt(self.state.pageIndex)+1,
                    payload:payload.data,
                    totalCount:payload.count,
                    sampleType:obj.sampleType || self.state.sampleType,
                    isMenuRender:false
                },function(){
                    window.historyStates.states[len] = self.state;
                })

                obj.pageIndex = obj.pageIndex + 1;
                $("#scroll_box").unbind('scroll');
                self.scrollPos($("#scroll_box"),$("#scroll_content"),obj);
                //console.log(payload.totalCount);
            })
    },

    scrollPos:function(box,cont,params){
        var self = this;
        var len = window.historyStates.states.length - 1;

        box.bind("scroll",function(){
            //console.log(box.scrollTop() + box.height() + ' ' + cont.height());
            if(box.scrollTop() + box.height() >= cont.height() && !window.isFeching){
                self.scrollFunc(self.state.baseUrl,params);
                params.pageIndex = params.pageIndex + 1;
            }

            self.setState({
                scrollTop:box.scrollTop(),
                isMenuRender:false
            });
            window.historyStates.states[len].scrollTop = box.scrollTop();
        });
    },

    scrollFunc:function(url,params) {
        var self = this;
        var len = window.historyStates.states.length - 1;

        if(parseInt(self.state.totalCount)>0 &&
            parseInt(self.state.pageSize)*parseInt(self.state.pageIndex - 1) >parseInt(self.state.totalCount))
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
                },function(){
                    window.historyStates.states[len] = self.state;
                });
                window.isFeching = false;
                window.clearTimeout(timeout);
                $('#loaderIndicator').removeClass('isShow');
            })
    },

    render: function() {
        var self = this;
        var winWidth = $(window).width();
        var pageData = self.state.payload;
        var baseUrl = self.state.baseUrl;
        var stylesList = self.state.stylesList;
        var addressList = self.state.addressList;

        return (
            <div className="app has-navbar-top samples-view">
                <WXHeaderMenu menuType={'menu_1'} name={0} isRender={self.state.isMenuRender} />

                <div className="screening-box-wx">
                    <ul className="screening-list-wx" id="style_box">
                        <li onClick={self.screeningFunc.bind(self,{})}>全部风格</li>
                        {
                            $.map(stylesList || [],function(v,i){
                                return (
                                    <li key={i} onClick={self.screeningFunc.bind(self,{shootingStyleId:v.id})}>{v.name}</li>
                                )
                            })
                        }
                    </ul>
                    <div className="btn-box-wx" id="btn_style">
                        <span className="btn-wx">风格</span>
                    </div>
                </div>
                <div className="screening-box-wx" style={{right:'90px'}}>
                    <ul className="screening-list-wx" id="address_box">
                        <li onClick={self.screeningFunc.bind(self,{})}>全部场景</li>
                        {
                            $.map(addressList || [],function(v,i){
                                return (
                                    <li key={i} onClick={self.screeningFunc.bind(self,{exteriorId:v.id})}>{v.name}</li>
                                )
                            })
                        }
                    </ul>
                    <div className="btn-box-wx" id="btn_address">
                        <span className="btn-wx">场景</span>
                    </div>
                </div>
                <div className='supplies-list'>
                    <div className='menu-classify menu-classify-car clearfix'>
                        <span onClick={self.screeningFunc.bind(self,{sampleType:0})}>婚纱摄影</span>
                        <span onClick={self.screeningFunc.bind(self,{sampleType:1})}>艺术写真</span>
                    </div>
                    <div className='scroll-box scroll-padding-100'>
                        <div className='hidden-box'>
                            <div className='scroll-view' id='scroll_box'>
                                <div className='list-view' id='scroll_content'>
                                    <ul className="list-1-wxjs clearfix">
                                        {
                                            $.map(pageData,function(v,i){
                                                return (
                                                    <li key={i}>
                                                        <ImageListItem
                                                            frameWidth={winWidth*2}
                                                            url={v.coverUrlWx}
                                                            sid={v.id}
                                                            detailBaseUrl={'sample/detail'}
                                                            />
                                                        <div className="title">
                                                            <span className="cn" >{v.name}</span>
                                                            <span className="en">{}</span>
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
            </div>

        );
    }

});

module.exports = WXSampleList;
