var React = require('react');
var Router = require('react-router-ie8');
var Api = require('../config/api.js');
var ImageListItem = require('./image-item.js');
var WXHeaderMenu = require('./wx-header-menu.js');

var WXWeddingClass = React.createClass({
    mixins:[Router.State], //我们需要知道当前的path params 等等信息
    //初始化状态。
    // 分页，资源标示，数据，根路由，总条数， 风格类型
    getInitialState: function() {
        var self = this;

        return {
            pageSize:10,
            pageIndex:1,
            payload:[],
            baseUrl:'',
            totalCount:0,
            headerCof:[5,1,4,1,3,'钻石百科',1,1],       //所在菜单中的下标
            headerType:['menu_1','menu_2','menu_3','menu_4','menu_5','menu_6','menu_7','menu_8'],
            router:self.getPath().substr(1).split('/'),
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

    componentWillMount : function(){
        var self = this;

        window.historyStates.isBack === true &&
        (self.state.isMenuRender = false);
    },

    componentDidMount: function() {
        var self = this;
        var hState;

        if(window.historyStates.isBack){
            //console.log(window.historyStates.states);
            hState = window.historyStates.states.pop();
            self._history(hState);
            window.historyStates.isBack = false;
            return
        }

        self.dataFunc();
    },

    dataFunc:function(){
        var self = this;
        var router = self.state.router;
        var type = router[1];
        var module = router[0].split('_')[0];
        var url = 'weddingroom/' + module + '_class_list';

        self.fetchData(url,
            {
                pageSize:self.state.pageSize,
                pageIndex:self.state.pageIndex,
                moduleTypeId:type
            }).done(function(payload){
                (payload.data && payload.code === 200) && self.setState({
                    baseUrl:router[0],
                    payload:payload.data,
                    totalCount:parseInt(payload.data.count)
                },function(){
                    window.historyStates.states.push(self.state);
                });

                //(payload.data && payload.code === 200) && console.log(payload.data);
                self.scrollPos($("#scroll_box"),$("#scroll_content"));
            }
        );
    },

    scrollPos:function(box,cont){
        var self = this;
        var len = window.historyStates.states.length - 1;

        box.bind("scroll",function(){
            if(box.scrollTop() + box.height() >= cont.height() && !window.isFeching){
                self.scrollFunc(self.state.baseUrl,{
                    pageSize:self.state.pageSize,
                    pageIndex:parseInt(self.state.pageIndex) + 1,
                    moduleTypeId:self.state.router[1]
                });
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

        if(parseInt(self.state.totalCount)>0 &&
            parseInt(self.state.pageSize)*parseInt(self.state.pageIndex) >parseInt(self.state.totalCount))
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
                    payload:self.state.payload.concat(payload.data.data),
                    pageIndex:parseInt(self.state.pageIndex)+1,
                    isMenuRender:false
                });

                window.isFeching = false;
                window.clearTimeout(timeout);
                $('#loaderIndicator').removeClass('isShow');
            })
    },

    render: function(){
        var self = this;
        var pageData = self.state.payload || [];
        var router = self.state.router || [];

        return (
            <div className="weddingclass-list-view mobile-main-box">
                <WXHeaderMenu isRender={self.state.isMenuRender} menuType={self.state.headerType[router[1]-1]} name={self.state.headerCof[router[1]-1]} />

                <div className='weddingclass-list' id='scroll_box'>
                    <div id='scroll_content' className='scroll-countent'>
                        <ul className="list-6-wxjs clearfix">
                            {
                                $.map(pageData,function(v,i){
                                    return(
                                        <li key={i}>
                                            <a className='href-box' href={'#/weddingroom/detail/' + v.id}>
                                                <span className='img-box'><img src={v.coverUrlWx} /></span>
                                                <h1>{v.title}</h1>
                                                <p>{v.description}</p>
                                                <span className='time'>{v.updateTime.split(' ')[0]}</span>
                                            </a>
                                        </li>
                                    )
                                })
                            }
                        </ul>
                    </div>
                    <div id="loaderIndicator" className="btn-more"><span id="loading-info">正在加载... ...</span></div>
                </div>
            </div>
        );
    }
});

module.exports = WXWeddingClass;
