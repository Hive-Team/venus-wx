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
            quarterly:[],
            caseStyle:[],
            scrollTop:0,
            currentCard:0,
            isMenuRender:true
        };
    },

    fetchData:function(url,params){
        return Api.httpGET(url,params);
    },

    _domControl : function(){
        var self = this;
        var $style_box = $('#style_box');
        var $btn_style = $('#btn_style');
        var isStyleMenu = false;
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
            !obj && (obj = {pageIndex:self.state.pageSize,pageSize:self.state.pageSize});
            self._domControl();
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

        self._domControl();

        var parseResource = function(){
            var url = self.getPath().substr(1);
            var params = {
                pageSize:self.state.pageSize,
                pageIndex:self.state.pageIndex
            };

            //console.log(resourceLinks);
            (url === 'cases') && (url = url + '/scheme_list') ||
            (url = url + '/weddingpat_list');

            self.fetchData(url,params)
                .done(function(payload){
                    //console.log(payload.data);
                    (payload.data && payload.data.length>0 && payload.code === 200) &&
                    self.setState({
                        payload:((self.state.pageIndex === 1)?payload.data : self.state.payload.concat(payload.data)),
                        pageIndex:parseInt(self.state.pageIndex)+1,
                        baseUrl:url,
                        scrollUrl:url,
                        totalCount:parseInt(payload.count)
                    },function(){
                        window.historyStates.states.push(self.state);
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
            self.fetchData('followPhotoSeason/all')
                .done(function(payload){
                    self.setState({
                        quarterly:payload.data
                    })
                });
        }

        var caseStyle = function(){
            self.fetchData('caseStyle/all')
                .done(function(payload){
                    //console.log(payload.data);
                    self.setState({
                        caseStyle:payload.data
                    })
                });
        }

        $.when({})
            .then(season)
            .then(caseStyle)
            .then(parseResource);
    },

    selSeason : function(id){
        var self = this;
        var currentCard,itemCurrentCard;
        var $menu_classify = $('.menu-classify');
        var len = window.historyStates.states.length - 1;
        var url = self.state.baseUrl;

        self.setState({
            pageIndex:1
        });

        $('span',$menu_classify).each(function(i,e){
            if($(this).hasClass('item-current')) currentCard = i;
        });

        $('li',$menu_classify).each(function(i,e){
            $(this).hasClass('li-current') === true && (itemCurrentCard = i);
        });

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
                totalCount:payload.count,
                currentCard:currentCard,
                itemCurrentCard:itemCurrentCard,
                isMenuRender:false
            },function(){
                window.historyStates.states[len] = self.state;
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
        var len = window.historyStates.states.length - 1;

        box.bind("scroll",function(){
            if(box.scrollTop() + box.height() >= cont.height() && !window.isFeching){
                self.scrollFunc(self.state.scrollUrl,params);
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
                    payload:((params === 1)?payload.data : self.state.payload.concat(payload.data)),
                    pageIndex:parseInt(self.state.pageIndex)+1
                },function(){
                    window.historyStates.states[len] = self.state;
                });
                window.isFeching = false;
                window.clearTimeout(timeout);
                $('#loaderIndicator').removeClass('isShow');
            })

    },

    clickFunc : function(obj){
        var self = this;
        var len = window.historyStates.states.length - 1;
        var currentCard,itemCurrentCard;
        var $menu_classify = $('.menu-classify');
        var params = {
            pageIndex:1,
            pageSize:6
        }

        $.extend(obj,params);

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
                    pageIndex:obj.pageIndex,
                    totalCount:payload.totalCount,
                    currentCard:currentCard,
                    itemCurrentCard:itemCurrentCard,
                    isMenuRender:false
                },function(){
                    window.historyStates.states[len] = self.state;
                })

                $("#scroll_box").unbind('scroll');
                self.scrollPos($("#scroll_box"),$("#scroll_content"),obj);
            })
    },

    render: function() {
        var self = this;
        var pageData = this.state.payload;
        var quarterly = self.state.quarterly || [];
        var baseUrl = this.state.scrollUrl;
        var caseStyle = this.state.caseStyle;

        return (
            <div className="app supplies-list-view">
                <WXHeaderMenu isRender={self.state.isMenuRender} menuType={'menu_3'} name={self.getPath() === '/cases' ? 0 : 1} />

                <div className='menu-classify clearfix' id='supplies_menu' style={{display:self.getPath() === '/cases' && 'block' || 'none'}}>
                    <div className='pos-box'>
                        <span onClick={self.clickFunc.bind(self,{})}>全部</span>
                        <span>风格</span>
                        <span>价位</span>
                        <ul>
                            {
                                $.map(caseStyle,function(v,i){
                                    return(
                                        <li key={i} onClick={self.clickFunc.bind(self,{styleId:v.id})}><b>{v.name}</b></li>
                                    )
                                })
                            }
                        </ul>
                        <ul>
                            <li onClick={self.clickFunc.bind(self,{minPrice:5000,maxPrice:9999})}><b>5000-10000</b></li>
                            <li onClick={self.clickFunc.bind(self,{minPrice:10000,maxPrice:14999})}><b>10000-15000</b></li>
                            <li onClick={self.clickFunc.bind(self,{minPrice:15000,maxPrice:19999})}><b>15000-20000</b></li>
                            <li onClick={self.clickFunc.bind(self,{minPrice:20000,maxPrice:29999})}><b>20000-30000</b></li>
                            <li onClick={self.clickFunc.bind(self,{minPrice:30000,maxPrice:49999})}><b>30000-50000</b></li>
                            <li onClick={self.clickFunc.bind(self,{minPrice:50000,maxPrice:99999})}><b>50000-100000</b></li>
                            <li onClick={self.clickFunc.bind(self,{minPrice:100000})}><b>100000以上</b></li>
                        </ul>
                    </div>
                </div>

                <div style={{display:''}} className={self.getPath() === '/cases' && 'screening-box-wx weddingpat-fj' || 'screening-box-wx'}>
                    <ul className="screening-list-wx" id="style_box">
                        <li onClick={self.selSeason.bind(self,null)}>{'最佳案例'}</li>
                        {
                            $.map(quarterly || [],function(v,i){
                                return (
                                    <li key={i} onClick={self.selSeason.bind(self,v.id)}>{v.name}</li>
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
                                    <ul className="list-3-wxjs" style={{paddingTop:self.getPath() === '/cases' && '110px' || '60px'}}>
                                        {
                                            pageData.length>0&&$.map(pageData,function(v,k){
                                                return (
                                                    <li key={k}>
                                                        <ImageListItem
                                                            url={v.coverUrlWx}
                                                            sid={v.id}
                                                            detailBaseUrl={baseUrl.split('/')[0] + '/detail'}
                                                            />
                                                        <div className="white-block" />
                                                        <div className="info">
                                                            <h1>{v.name}</h1>
                                                            <div className="func">
                                                                <span className="style"><b>{(parseInt(v.totalCost) === 0)?'':'价格：¥'+parseInt(v.totalCost).toFixed(2)}</b></span>
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
