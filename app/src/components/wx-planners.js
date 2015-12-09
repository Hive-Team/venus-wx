var React = require('react');
var PropTypes = React.PropTypes;
var Router = require('react-router-ie8');
var Api = require('../config/api.js');
var SKMap = require('../config/wx-skmap.js');
var ImageListItem = require('./image-item.js');
var WXHeaderMenu = require('./wx-header-menu.js');

var WXPlanners = React.createClass({
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

        function scrollPos(box,cont){
            box.bind("scroll",function(){
                if(box.scrollTop() + box.height() >= cont.height() && !window.Core.isFeching){
                    scrollFunc(self.state.baseUrl,{
                        pageSize:self.state.pageSize,
                        pageIndex:parseInt(self.state.pageIndex) + 1
                    });
                }
            });
        }

        function scrollFunc(url,params) {
            if(parseInt(self.state.totalCount)>0 &&
                parseInt(self.state.pageSize)*parseInt(self.state.pageIndex) >parseInt(self.state.totalCount))
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
                        payload:self.state.payload.concat(payload.data),
                        pageIndex:parseInt(self.state.pageIndex)+1
                    });
                    //console.log(payload);
                    window.Core.isFeching = false;
                    window.clearTimeout(timeout);
                    $('#loaderIndicator').removeClass('isShow');
                });
        }

        // 从菜单获取资源链接。
        var parseResource = function(){

            self.fetchData('planner',
                {
                    pageSize:self.state.pageSize,
                    pageIndex:self.state.pageIndex
                })
                .done(function(payload){
                    (payload.data && payload.code === 200) &&
                    self.setState({
                        payload:((self.state.pageIndex === 1)?payload.data : self.state.payload.concat(payload.data)),
                        baseUrl:'planner',
                        totalCount:parseInt(payload.totalCount)
                    });

                    //console.log(payload.data);
                    //绑上滚动加载。
                    scrollPos($("#scroll_box"),$("#scroll_content"));
                });
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

    render: function() {
        var self = this;
        var winWidth = $(window).width();
        var pageData = self.state.payload;
        var baseUrl = self.state.baseUrl;

        return (
            <div className="app has-navbar-top">
                <WXHeaderMenu menuType={'menu_3'} name={3} />

                <div className='planner-list-view'>
                    <div className='planner-list' id='scroll_box'>
                        <div id='scroll_content' className='scroll-countent'>
                            <div className='content-box'>
                                <ul className='clearfix'>
                                    {
                                        $.map(
                                            pageData || [],
                                            function(v,i){
                                                return(
                                                    <li key={i} className='list-item-6-wxjs'>
                                                        <div className='avatar-box'><img src={v.photoUrl} /></div>
                                                        <div className='info-box'>
                                                            <div className='title-box'>
                                                                <h3 className='title'>{v.plannerName}</h3>
                                                                <div style={{display:'none'}}><i>+</i><span>关注</span></div>
                                                            </div>
                                                            <ul className='list-img clearfix'>
                                                                {
                                                                    $.map(
                                                                        v.list,
                                                                        function(vv,ii){
                                                                            return(
                                                                                <li key={ii}>
                                                                                    <ImageListItem frameWidth={winWidth} detailBaseUrl={baseUrl} sid={i + 1 + '/' + ii} url={vv.imageUrl}  />
                                                                                </li>
                                                                            )
                                                                        }
                                                                    )
                                                                }
                                                            </ul>
                                                        </div>
                                                    </li>
                                                )
                                            }
                                        )
                                    }
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div id="loaderIndicator" className="btn-more"><span id="loading-info">正在加载... ...</span></div>
                </div>
            </div>

        );
    }

});

module.exports = WXPlanners;
