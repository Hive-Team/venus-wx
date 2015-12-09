var React = require('react');
var PropTypes = React.PropTypes;
var Router = require('react-router-ie8');
var Api = require('../config/api.js');
var SKMap = require('../config/wx-skmap.js');
var ImageListItem = require('./image-item.js');
var WXHeaderMenu = require('./wx-header-menu.js');

var WXWeddingDress = React.createClass({
    mixins:[Router.State], //我们需要知道当前的path params 等等信息
    //初始化状态。
    // 分页，资源标示，数据，根路由，总条数， 风格类型
    getInitialState: function() {
        return {
            pageSize:6,
            pageIndex:1,
            tplKey:'list#planner',
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

    componentWillMount : function() {
        //$('.pswp').css({display:'none'});

    },

    componentDidMount: function() {
        var self = this;
        var $screening_box = $('#screening_box');

        $screening_box.on('click','.item',function(){
            $('.item',$screening_box).removeClass('item-current');
            $(this).addClass('item-current');
        });

        // 从菜单获取资源链接。
        var parseResource = function(){

            self.fetchData('dress/brands',
                {
                    pageSize:self.state.pageSize,
                    pageIndex:self.state.pageIndex,
                    weddingDressType:1
                })
                .done(function(payload){
                    (payload.data && payload.code === 200) &&
                    self.setState({
                        payload:((self.state.pageIndex === 1)?payload.data : self.state.payload.concat(payload.data)),
                        pageIndex:parseInt(self.state.pageIndex)+1,
                        baseUrl:'dress/brands',
                        totalCount:parseInt(payload.totalCount)
                    });

                    //console.log(payload.data)
                    // 绑上滚动加载。
                    //self.scrollPos($("#scroll_box"),$("#scroll_content"));

                })
        };

        var fetchStyle = function(){
            Api.httpGET('condition/styleAddress',{})
                .done(function(payload){
                    (payload.data && payload.code === '200') &&
                    self.setState({
                        stylesList:payload.data.style || []
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

    screeningClick : function(url,obj){
        var self = this;
        self.state.pageIndex = 1;
        var params = {
            pageSize: self.state.pageSize,
            pageIndex: self.state.pageIndex
        }

        for(var i in obj)
            params[i] = obj[i];

        self.fetchData(url,params)
            .done(function(payload){
                (payload.data && payload.code === 200) &&
                self.setState({
                    payload:payload.data,
                    pageIndex:parseInt(self.state.pageIndex)+1,
                    baseUrl:url,
                    totalCount:parseInt(payload.totalCount)
                });

                $("#scroll_box").unbind('scroll');
                //console.log(JSON.stringify(payload.data,null,4));
                //self.scrollPos($("#scroll_box"),$("#scroll_content"),params);
            })
    },

    scrollPos : function(box,cont,params){
        var self = this;
        if(!params) params = {
            pageSize:self.state.pageSize,
            pageIndex:self.state.pageIndex
        }

        box.bind("scroll",function(){
            //console.log(box.scrollTop() + box.height() + " , " + (cont.height() + 80));
            if(box.scrollTop() + box.height() >= cont.height() + 80 && !window.Core.isFeching){
                //console.log(params);
                params.pageIndex = self.state.pageIndex;
                self.scrollFunc(self.state.baseUrl,params);
            }
        });
    },

    scrollFunc : function(url,params) {
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
                (payload.data && payload.code === 200) &&
                self.setState({
                    payload:((self.state.pageIndex === 1)?payload.data : self.state.payload.concat(payload.data)),
                    pageIndex:parseInt(self.state.pageIndex)+1
                });
                window.Core.isFeching = false;
                window.clearTimeout(timeout);
                $('#loaderIndicator').removeClass('isShow')
                //console.log(payload.data);
            })
    },

    render: function() {
        var self = this;
        var winWidth = $(window).width();
        var pageData = self.state.payload;
        var baseUrl = self.state.baseUrl;

        return (
            <div className='weddindress-list-view mobile-main-box'>
                <WXHeaderMenu menuType={'menu_4'} name={0} />
                <div className="weddindress-list" id="scroll_box">
                    <div className='screening-box' id='screening_box'>
                        <div className='item item-current'><span onClick={self.screeningClick.bind(self,baseUrl,{weddingDressType:1})}>国际婚纱</span></div>
                        <div className='item'><span onClick={self.screeningClick.bind(self,baseUrl,{weddingDressType:2})}>新娘礼服</span></div>
                        <div className='item'><span onClick={self.screeningClick.bind(self,baseUrl,{weddingDressType:3})}>男士礼服</span></div>
                    </div>
                    <div id='scroll_content'>
                        <div className='wedding-dress-scroll-content'>
                            <ul className='list-wedding-dress'>
                                {
                                    $.map(pageData || [],function(v,i){
                                        return(
                                            <li key={i}>
                                                <div className='title-box'><img style={{display:'none'}} /><h3>{v.weddingDressBrandName}</h3><span style={{display:'none'}}>共12款</span></div>
                                                <p>{v.description}</p>
                                                <div className='product-box'>
                                                    <a href={'#/dress/brand/' +  v.weddingDressBrandId}><img src={v.imageUrl} /></a>
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

        );
    }

});

module.exports = WXWeddingDress;
