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
            pageSize:50,
            pageIndex:1,
            tplKey:'list#planner',
            payload:[],
            baseUrl:'',
            totalCount:0,
            stylesList:[],
            id:1,
        };
    },

    //取数据
    fetchData:function(url,params){
        return Api.httpGET(url,params);
    },

    componentDidMount: function() {
        var self = this;
        var $screening_box = $('#screening_box');
        var params = {
            pageIndex:self.state.pageIndex,
            pageSize:self.state.pageSize,
            weddingDressType:self.state.id
        }

        $screening_box.on('click','.item',function(){
            $('.item',$screening_box).removeClass('item-current');
            $(this).addClass('item-current');
        });

        var url = 'dressBrand/all';

        // 从菜单获取资源链接。
        var parseResource = function(){

            self.fetchData(url,params)
                .done(function(payload){
                    (payload.data && payload.code === 200) &&
                    self.setState({
                        payload:payload.data,
                        pageIndex:parseInt(self.state.pageIndex)+1,
                        baseUrl:url,
                        totalCount:parseInt(payload.totalCount)
                    });

                    //console.log(payload.data)
                    // 绑上滚动加载。
                    //self.scrollPos($("#scroll_box"),$("#scroll_content"));
                })
        };

        $.when({})
            .then(parseResource);

    },

    screeningClick : function(url,id){
        var self = this;
        var params = {
            pageIndex:self.state.pageIndex,
            pageSize:self.state.pageSize,
            weddingDressType:id
        }

        self.fetchData(url,params)
            .done(function(payload){
                (payload.data && payload.code === 200) &&
                self.setState({
                    payload:payload.data,
                    baseUrl:url,
                    id:id,
                    totalCount:parseInt(payload.totalCount)
                });

                $("#scroll_box").unbind('scroll');
                //console.log(payload.data);
                //self.scrollPos($("#scroll_box"),$("#scroll_content"),params);
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
                        <div className='item item-current'><span onClick={self.screeningClick.bind(self,baseUrl,1)}>国际婚纱</span></div>
                        <div className='item'><span onClick={self.screeningClick.bind(self,baseUrl,2)}>新娘礼服</span></div>
                        <div className='item'><span onClick={self.screeningClick.bind(self,baseUrl,3)}>男士礼服</span></div>
                    </div>
                    <div id='scroll_content'>
                        <div className='wedding-dress-scroll-content'>
                            <ul className='list-wedding-dress'>
                                {
                                    $.map(pageData || [],function(v,i){
                                        return(
                                            <li key={i}>
                                                <div className='title-box'><img style={{display:'none'}} /><h3>{v.name}</h3><span style={{display:'none'}}>共12款</span></div>
                                                <p>{v.description}</p>
                                                <div className='product-box'>
                                                    <ImageListItem
                                                        frameWidth={winWidth*2}
                                                        url={v.coverUrlWx}
                                                        sid={v.id}
                                                        detailBaseUrl={
                                                            self.state.id === 1 && 'dress/dress_brand_top' ||
                                                            self.state.id === 2 && 'dress/dress_brand_female' ||
                                                            self.state.id === 3 && 'dress/dress_brand_male'
                                                        }
                                                        />
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
