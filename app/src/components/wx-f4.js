var React = require('react');
var PropTypes = React.PropTypes;
var Router = require('react-router-ie8');
var Api = require('../config/api.js');
var SKMap = require('../config/wx-skmap.js');
var ImageListItem = require('./image-item.js');
var WXHeaderMenu = require('./wx-header-menu.js');

var WXF4 = React.createClass({
    mixins:[Router.State], //我们需要知道当前的path params 等等信息
    //初始化状态。
    // 分页，资源标示，数据，根路由，总条数， 风格类型
    getInitialState: function() {
        return {
            pageSize:6,
            pageIndex:1,
            payload:[],
            baseUrl:'',
            totalCount:0,
            stylesList:[],
            dataConf : {
                'f4/host' : "hoster/imageUrl/videoUrl",
                'f4/dresser' : "dresser/imageUrl/detailImages",
                'f4/photographer' : "photographer/imageUrl/detailImages",
                'f4/camera' : "cameraman/imageUrl/videoUrl"
            },
            scrollTop:0,
            currentCard:0,
            itemCurrentCard:null,
            isMenuRender:true
        };
    },
    //取数据
    fetchData:function(url,params){
        return Api.httpGET(url,params);
    },

    _domControl : function(){
        var self = this;
        var $screening_box = $('#screening_box');
        var $f4_hidden = $('#f4_hidden');
        var $style_box = $('#style_box');
        var $btn_style = $('#btn_style');
        var $f4_box = $('.f4-hidden-box');
        var isStyleMenu = false;

        $('.item',$screening_box).eq(self.state.currentCard).addClass('item-current');
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

        $screening_box.on('click','.item',function(){
            $('.item',$screening_box).removeClass('item-current');
            $(this).addClass('item-current');
        });

        $f4_hidden.height($(window).height()-100);

        $f4_box.on('click','.more-cont',function(){
            $(this).hide().siblings('.description').css({height:'auto'});
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

        // 从菜单获取资源链接。
        var parseResource = function(){

            self.fetchData('f4/host',
                {
                    pageSize:self.state.pageSize,
                    pageIndex:self.state.pageIndex
                })
                .done(function(payload){
                    (payload.data && payload.code === 200) &&
                    self.setState({
                        payload:((self.state.pageIndex === 1)?payload.data : self.state.payload.concat(payload.data)),
                        pageIndex:parseInt(self.state.pageIndex)+1,
                        baseUrl:'f4/host',
                        totalCount:parseInt(payload.count)
                    },function(){
                        window.historyStates.states.push(self.state);
                    });

                    //console.log(payload.totalCount);
                    // 绑上滚动加载。
                    self.scrollPos($("#f4_hidden"),$("#scroll_content"));

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
        $.when({})
            .then(fetchStyle)
            .then(parseResource);

    },

    screeningClick : function(url){
        var self = this;
        var len = window.historyStates.states.length - 1;
        var $screening_box = $('#screening_box');
        var currentCard;
        self.state.pageIndex = 1;
        var params = {
            pageSize: self.state.pageSize,
            pageIndex: self.state.pageIndex
        }

        $('.item',$screening_box).each(function(i,e){
            if($(this).hasClass('item-current')) currentCard = i;
        });

        self.fetchData(url,params)
            .done(function(payload){
                (payload.data && payload.code === 200) &&
                self.setState({
                    payload:payload.data,
                    pageIndex:parseInt(self.state.pageIndex)+1,
                    baseUrl:url,
                    totalCount:parseInt(payload.count),
                    currentCard:currentCard,
                    isMenuRender:false
                },function(){
                    window.historyStates.states[len] = self.state;
                })

                $("#f4_hidden").unbind('scroll');
                //console.log(payload);
                //console.log(JSON.stringify(payload.data,null,4));
                //console.log(self.state.baseUrl);
                self.scrollPos($("#f4_hidden"),$("#scroll_content"),params);
            })
    },


    scrollPos : function(box,cont,params){
        var self = this;
        if(!params) params = {
            pageSize:self.state.pageSize,
            pageIndex:self.state.pageIndex
        }

        box.bind("scroll",function(){
            //console.log(box.scrollTop() + box.height() + " , " + cont.height());
            if(box.scrollTop() + box.height() >= (cont.height() - 5) && !window.isFeching){
                //console.log(params);
                params.pageIndex = self.state.pageIndex;
                self.scrollFunc(self.state.baseUrl,params);
            }

            self.state.scrollTop = box.scrollTop();
            self.state.isMenuRender = false;

            window.historyStates.states[len].scrollTop = box.scrollTop();
        });
    },

    scrollFunc : function(url,params) {
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
                    pageIndex:parseInt(self.state.pageIndex)+1,
                    currentCard:currentCard,
                    isMenuRender:false
                },function(){
                    console.log(self.state)
                    window.historyStates.states[len] = self.state;
                });
                window.isFeching = false;
                window.clearTimeout(timeout);
                $('#loaderIndicator').removeClass('isShow');
                //console.log(payload.data);
            })
    },

    priceSort : function(obj){
        var self = this;
        var len = window.historyStates.states.length - 1;
        var params = {
            pageIndex:1,
            pageSize:self.state.pageSize
        }

        for(var i in obj) params[i] = obj[i];

        self.fetchData(self.state.baseUrl,params)
            .done(function(payload){
                (payload.data && payload.code===200)&&
                self.setState({
                    pageIndex:params.pageIndex,
                    payload:payload.data,
                    totalCount:payload.count,
                    currentCard:currentCard,
                    isMenuRender:false
                },function(){
                    console.log(self.state)
                    window.historyStates.states[len] = self.state;
                })
            })
    },

    saveData : function(data){
        var self = this;
        window.localStorage.clear();
        var storage = window.localStorage;
        var url = self.state.baseUrl.split('/')[1];

        (url == 'host' || url == 'camera') &&
        (storage.f4VideoData = data) ||
        (storage.f4ImgData = data);
    },

    render: function() {
        var self = this;
        var pageData = self.state.payload;
        var baseUrl = self.state.baseUrl;
        //var srcArr = self.state.dataConf[baseUrl] !== undefined && self.state.dataConf[baseUrl].split('/');
        var priceArr = [
            {minPrice:3001},
            {minPrice:2500,maxPrice:3000},
            {minPrice:2000,maxPrice:2500},
            {minPrice:1500,maxPrice:2000},
            {maxPrice:1499},
            {}
        ];

        return (
            <div className="app has-navbar-top">
                <WXHeaderMenu menuType={'menu_3'} name={3} isRender={self.state.isMenuRender} />

                <div className='f4-list-view' id='scroll_box'>
                    <div className='screening-box' id='screening_box'>
                        <div className='item'><span onClick={self.screeningClick.bind(self,'f4/host')}>主持人</span></div>
                        <div className='item'><span onClick={self.screeningClick.bind(self,'f4/dresser')}>化妆师</span></div>
                        <div className='item'><span onClick={self.screeningClick.bind(self,'f4/photographer')}>摄影师</span></div>
                        <div className='item'><span onClick={self.screeningClick.bind(self,'f4/camera')}>摄像师</span></div>
                    </div>
                    <div className="screening-box-wx">
                        <ul className="screening-list-wx" id="style_box">
                            {
                                $.map(priceArr || [],function(v,i){
                                    return (
                                        <li key={i} onClick={self.priceSort.bind(self,v)}>
                                            {
                                                (v.minPrice != null && v.maxPrice != null) && (v.minPrice + '-' + v.maxPrice) ||
                                                (v.minPrice == null && v.maxPrice != null) && (v.maxPrice + 1 + '以下') ||
                                                (v.minPrice != null && v.maxPrice == null) && (v.minPrice - 1 + '以上') ||
                                                (v.minPrice == null && v.maxPrice == null) && '全部'
                                            }
                                        </li>
                                    )
                                })
                            }
                        </ul>
                        <div className="btn-box-wx" id="btn_style">
                            <span className="btn-wx">价格</span>
                        </div>
                    </div>
                    <div className='scroll-countent'>
                        <div className='f4-hidden-box'>
                            <div className='content' id='f4_hidden'>
                                <div className='scroll-content' id='scroll_content'>
                                    <ul className='f4-list bottom-box clearfix'>
                                        {
                                            $.map(
                                                pageData || [],
                                                function(v,i){
                                                    return(
                                                        <li key={i} className='list-item-6-wxjs'>
                                                            <div className='avatar-box'><img src={v.photoUrl} /></div>
                                                            <div className='info-box'>
                                                                <div className='title-box'>
                                                                    <h3 className='title'>{v.nickName}</h3>
                                                                    <div style={{display:'none'}}><i>+</i><span>关注</span></div>
                                                                </div>
                                                                <div className='description-box'>
                                                                    <p className='description'>{v.description === '' && '简介：暂无' || '简介：' + v.description}</p>
                                                                    <span className={v.description === '' && 'more-cont none' || 'more-cont'}>查看全部</span>
                                                                </div>
                                                                <ul className='list-img clearfix'>
                                                                    {
                                                                        $.map(
                                                                            v.workList || [],
                                                                            function(vv,ii){
                                                                                return(
                                                                                    <li key={ii} onClick={self.saveData.bind(self,vv.videoUrl || vv.wxDetailImages)}>
                                                                                        <ImageListItem frameWidth={200} detailBaseUrl={baseUrl} sid={vv.id} url={vv.coverUrlWx} />
                                                                                    </li>
                                                                                )
                                                                            }
                                                                        )
                                                                    }
                                                                </ul>
                                                                <div className='price-box'><strong>报价：</strong><span>￥</span><b>{v.price}</b></div>
                                                                <p className='price-des'>{v.skillPriceRemark}</p>
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
                    </div>
                    <div id="loaderIndicator" className="btn-more"><span id="loading-info">正在加载... ...</span></div>
                </div>
            </div>

        );
    }

});

module.exports = WXF4;
