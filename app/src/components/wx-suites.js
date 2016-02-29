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
            pageSize:50,
            pageIndex:1,
            payload:[],
            baseUrl:'',
            totalCount:0,
            scrollTop:0,
            isMenuRender:true
        };
    },
    //取数据
    fetchData:function(url,params){
        return Api.httpGET(url,params);
    },

    _history : function(hState,obj){
        var self = this;
        var box = $("#scroll_box");

        self.setState(hState,function(){
            !obj && (obj = {pageIndex:self.state.pageSize,pageSize:self.state.pageSize});
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

        /* 暂时隐藏
        function scrollPos(box,cont){
            box.bind("scroll",function(){
                if(box.scrollTop() + box.height() >= cont.height() && !window.Core.isFeching){
                    scrollFunc(self.state.baseUrl,{
                        pageSize:self.state.pageSize,
                        pageIndex:self.state.pageIndex
                    });
                }
            });
        }
        function scrollFunc(url,params) {
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
        }
        */

        // 从菜单获取资源链接。
        var parseResource = function(){
            var url = 'suite/suite_list';

            self.fetchData(url,
                {
                    pageSize:self.state.pageSize,
                    pageIndex:self.state.pageIndex
                })
                .done(function(payload){
                    (payload.data && payload.code === 200) &&
                    self.setState({
                        payload:((self.state.pageIndex === 1)?payload.data : self.state.payload.concat(payload.data)),
                        pageIndex:parseInt(self.state.pageIndex)+1,
                        baseUrl:url,
                        totalCount:parseInt(payload.totalCount)
                    },function(){
                        window.historyStates.states.push(self.state);
                    });

                    self.scrollPos($("#scroll_box"),$("#scroll_content"));
                    //console.log(payload.totalCount);
                    // 绑上滚动加载。
                    //scrollPos($("#scroll_box"),$("#scroll_content"));
                })
        };

        $.when({})
            .then(parseResource);
    },

    scrollPos:function(box,cont){
        var self = this;
        var len = window.historyStates.states.length - 1;

        box.bind("scroll",function(){
            //if(box.scrollTop() + box.height() >= cont.height() && !window.isFeching){
            //    self.scrollFunc(self.state.baseUrl,params);
            //    params.pageIndex = params.pageIndex + 1;
            //    //console.log(params.pageIndex);
            //    //$('#loaderIndicator').addClass('isShow');
            //}
            self.setState({
                scrollTop:box.scrollTop(),
                isMenuRender:false
            });
            window.historyStates.states[len].scrollTop = box.scrollTop();
        });
    },

    render: function() {
        var self = this;
        var winWidth = $(window).width();
        var pageData = self.state.payload;
        var baseUrl = self.state.baseUrl;

        return (
            <div className="app has-navbar-top">
                <WXHeaderMenu menuType={'menu_1'} name={2} isRender={self.state.isMenuRender} />

                <div className="app-body">
                    <div className="app-content">
                        <div className="app-content-loading">
                            <i className="fa fa-spin loading-spinner" />
                        </div>
                        <div className="scroll-able">
                            <div className="scroll-able-content suites-bg" id="scroll_box">
                                <div className="list-group list-box" id="scroll_content">
                                    <ul className='list-suites'>
                                        {
                                            $.map(pageData,function(v,i){
                                               return(
                                                   <li key={i} className='list-item-1-wxjs'>
                                                       <div className='title-box'>
                                                           <h1 className='title'>{v.name}</h1>
                                                           <span className='subtitle'>{'（' + v.createTime + '）'}</span>
                                                       </div>
                                                       <div className='img-box relative-box'>
                                                           <ImageListItem
                                                               detailBaseUrl={'suite/detail'}
                                                               frameWidth={winWidth*2}
                                                               url={v.coverUrlWx}
                                                               sid={v.id}
                                                               errorUrl={'http://placehold.it/375x250'}
                                                               />
                                                       </div>
                                                       <div className='info-box'>
                                                           <div className='containor clearfix'>
                                                               <div className='price'>
                                                                   <span className='red-1-wxjs'>￥</span><span className='red-1-wxjs big'>{v.salePrice + '.00'}</span><b className='gray-1-wxjs'>原价</b><b className='gray-1-wxjs'>{'￥' + v.originalPrice + '.00'}</b>
                                                               </div>
                                                               <a className='btn-1-wxjs' style={{display:'none'}}>立即抢购</a>
                                                           </div>
                                                           <div className='description'>
                                                               <p className='Paragraph'>{v.description}</p>
                                                           </div>
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
