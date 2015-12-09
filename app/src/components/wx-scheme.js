var React = require('react');
var PropTypes = React.PropTypes;
var Router = require('react-router-ie8');
var Api = require('../config/api.js');
var SKMap = require('../config/wx-skmap.js');
var ImageListItem = require('./image-item.js')
var WXHeaderMenu = require('./wx-header-menu.js');

var WXScheme = React.createClass({

    mixins:[Router.State], //我们需要知道当前的path params 等等信息
    getInitialState: function() {
        return {
            payload:[],
            totalCount:0,
            pageSize:6,
            pageIndex:1,
            baseUrl:'',
            scrollUrl:'',
            tplKey:'recommend#scheme',
            quarterly:[]
        };
    },
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

        var parseResource = function(){
            var arr = self.getPath().substr(1).split('/');
            var resourceLinks = window.Core.resource[SKMap['#/'+arr[0]]];
            var url;
            var params = {
                pageSize:self.state.pageSize,
                pageIndex:self.state.pageIndex
            }

            arr.length > 1 && (params.styleId = arr[2]);

            //console.log(resourceLinks);
            (self.getPath() === '/scheme') && (url = resourceLinks['实景案例列表'].split('#')[1]) ||
            (url = resourceLinks['最佳案例'].split('#')[1])

            self.fetchData(url,params)
                .done(function(payload){
                    (payload.data && payload.data.length>0 && payload.code === 200) &&
                    self.setState({
                        payload:((self.state.pageIndex === 1)?payload.data : self.state.payload.concat(payload.data)),
                        pageIndex:parseInt(self.state.pageIndex)+1,
                        baseUrl:resourceLinks,
                        scrollUrl:url,
                        totalCount:parseInt(payload.totalCount)
                    });

                    //绑上滚动加载。
                    self.scrollPos($("#scroll_box"),$("#scroll_content"),
                        {
                            pageSize:self.state.pageSize,
                            pageIndex:self.state.pageIndex
                        }
                    );

                })
        };

        var season = function(){
            self.fetchData('scheme/season')
                .done(function(payload){
                    self.setState({
                        quarterly:payload.data
                    })
                });
        }

        //console.log($.when(window.Core.promises['/']))
        $.when(window.Core.promises['/'])
            .then(season)
            .then(parseResource);
    },

    selSeason : function(id){
        var self = this;
        var url;

        self.setState({
            pageIndex:1
        });

        id === null && (url = self.state.baseUrl['最佳案例'].split('#')[1]) || (url = self.state.baseUrl['分季欣赏'].split('#')[1]);

        self.fetchData(url,{
            pageIndex:1,
            pageSize:self.state.pageSize,
            seasonId:id
        }).done(function(payload){
            (payload.data && payload.code===200)&&
            self.setState({
                pageIndex:1,
                styleId:id,
                scrollUrl:url,
                payload:payload.data,
                totalCount:payload.totalCount
            })
            //console.log(payload.data);

            $("#scroll_box").unbind('scroll');
            self.scrollPos($("#scroll_box"),$("#scroll_content"),
                {
                    pageSize:self.state.pageSize,
                    pageIndex:self.state.pageIndex + 1,
                    seasonId:id
                }
            );
        })
    },

    scrollPos:function(box,cont,params){
        var self = this;

        box.bind("scroll",function(){
            if(box.scrollTop() + box.height() >= cont.height() && !window.Core.isFeching){
                self.scrollFunc(self.state.scrollUrl,params);
                params.pageIndex ++;
            }
        });
    },

    scrollFunc:function(url,params) {
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
                    payload:((params === 1)?payload.data : self.state.payload.concat(payload.data)),
                    pageIndex:parseInt(self.state.pageIndex)+1
                });
                window.Core.isFeching = false;
                window.clearTimeout(timeout);
                $('#loaderIndicator').removeClass('isShow');
            })

    },

    render: function() {
        var self = this;
        var pageData = this.state.payload;
        var quarterly = self.state.quarterly || [];
        var baseUrl = this.state.scrollUrl;

        return (
            <div className="app ng-scope">
                <WXHeaderMenu menuType={'menu_3'} name={self.getPath() === '/scheme' ? 0 : 1} />

                <div className={self.getPath() === '/scheme' && 'screening-box-wx weddingpat-fj' || 'screening-box-wx'}>
                    <ul className="screening-list-wx" id="style_box">
                        <li onClick={self.selSeason.bind(self,null)}>{'最佳案例'}</li>
                        {
                            $.map(quarterly || [],function(v,i){
                                return (
                                    <li key={i} onClick={self.selSeason.bind(self,v.seasonId)}>{v.seasonName}</li>
                                )
                            })
                        }
                    </ul>
                    <div className="btn-box-wx" id="btn_style">
                        <span className="btn-wx">分季</span>
                    </div>
                </div>
                <div className="app-body">
                    <div className="app-content">
                        <div className="scroll-able ng-scope">
                            <div className="scroll-able-content" id="scroll_box">
                                <div className="list-group list-box" id="scroll_content">
                                    <ul className="list-3-wxjs">
                                        {
                                            pageData.length>0&&$.map(pageData,function(v,k){
                                                return (
                                                    <li key={k}>
                                                        <a href={'#/'+baseUrl+'/'+ v.weddingCaseId} className="img-box"><img src={(window.Core.mode=== 'dev')?v.weddingCaseImage:v.weddingCaseImage+'@1e_'+ $(window).width()+'w_1c_0i_1o_90q_2x'}/></a>
                                                        <div className="white-block" />
                                                        <div className="info">
                                                            <h1>{v.schemeName}</h1>
                                                            <div className="func">
                                                                <span className="style"><b>{(parseInt(v.totalPrice) === 0)?'':'价格：¥'+parseInt(v.totalPrice).toFixed(2)}</b></span>
                                                            </div>
                                                        </div>
                                                    </li>
                                                )
                                            })
                                        }
                                    </ul>
                                    <div className="btn-more" ><span id="loading-info">正在加载... ...</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        );
    }

});

module.exports = WXScheme;
