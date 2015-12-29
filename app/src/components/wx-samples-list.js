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
            tplKey:'list#samples',
            payload:[],
            baseUrl:'',
            totalCount:0,
            stylesList:[]
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
        var $address_box = $('#address_box');
        var $btn_address = $('#btn_address');
        var isStyleMenu = false;
        var isAddressMenu = false;

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
        });

        // 从菜单获取资源链接。
        var parseResource = function(){
            var pathArr = SKMap['#'+self.getPathname()].split('/');
            var resourceLinks = window.Core.resource;

            $.each(pathArr,function(k,v){
                resourceLinks = resourceLinks[v];
            });

            self.fetchData(resourceLinks.split('#')[1],
                {
                    pageSize:self.state.pageSize,
                    pageIndex:self.state.pageIndex
                })
                .done(function(payload){
                    (payload.data && payload.code === 200) &&
                    self.setState({
                        payload:((self.state.pageIndex === 1)?payload.data : self.state.payload.concat(payload.data)),
                        pageIndex:parseInt(self.state.pageIndex)+1,
                        baseUrl:resourceLinks.split('#')[1],
                        totalCount:parseInt(payload.totalCount)
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
            Api.httpGET('condition/styleAddress',{})
                .done(function(payload){
                    (payload.data && payload.code === '200') &&
                    self.setState({
                        stylesList:payload.data.style || [],
                        addressList:payload.data.address
                    },function(){
                        self.state.stylesList.length>0 &&
                        $('ul.screening-list').css({height:'100%'}).hide();
                        $('#btn_style').on('click',function(){
                            $('ul.screening-list').toggle();
                        })
                    })
                });
        };

        $.when(window.Core.promises['/'])
            .then(fetchStyle)
            .then(parseResource);

    },
    screeningFunc : function(obj){
        var self = this;
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
                    totalCount:payload.totalCount
                })

                obj.pageIndex = obj.pageIndex + 1;
                $("#scroll_box").unbind('scroll');
                self.scrollPos($("#scroll_box"),$("#scroll_content"),obj);
                //console.log(payload.totalCount);
            })
    },

    scrollPos:function(box,cont,params){
        var self = this;

        box.bind("scroll",function(){
            //console.log(box.scrollTop() + box.height() + ' ' + cont.height());
            if(box.scrollTop() + box.height() >= cont.height() && !window.Core.isFeching){
                self.scrollFunc(self.state.baseUrl,params);
                params.pageIndex = params.pageIndex + 1;
            }

        });
    },

    scrollFunc:function(url,params) {
        var self = this;

        //console.log(self.state.pageIndex);
        //console.log(parseInt(self.state.pageSize)*parseInt(self.state.pageIndex - 1));
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

    render: function() {
        var self = this;
        var winWidth = $(window).width();
        var pageData = self.state.payload;
        var baseUrl = self.state.baseUrl;
        var stylesList = self.state.stylesList ||[];
        var addressList = self.state.addressList ||[];

        return (
            <div className="app has-navbar-top">
                <WXHeaderMenu menuType={'menu_1'} name={0} />

                <div className="screening-box-wx">
                    <ul className="screening-list-wx" id="style_box">
                        <li onClick={self.screeningFunc.bind(self,{})}>全部风格</li>
                        {
                            $.map(stylesList || [],function(v,i){
                                return (
                                    <li key={i} onClick={self.screeningFunc.bind(self,{styleId:v.styleId})}>{v.styleName}</li>
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
                                    <li key={i} onClick={self.screeningFunc.bind(self,{addressId:v.addressId})}>{v.addressName}</li>
                                )
                            })
                        }
                    </ul>
                    <div className="btn-box-wx" id="btn_address">
                        <span className="btn-wx">场景</span>
                    </div>
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
                                                    frameWidth={winWidth*2}
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

        );
    }

});

module.exports = WXSampleList;
