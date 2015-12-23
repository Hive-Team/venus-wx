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
            tplKey:'list#f4',
            payload:[],
            baseUrl:'',
            totalCount:0,
            stylesList:[],
            dataConf : {
                'f4/host' : "hoster/imageUrl/videoUrl",
                'f4/dresser' : "dresser/imageUrl/detailImages",
                'f4/photographer' : "photographer/imageUrl/detailImages",
                'f4/camera' : "cameraman/imageUrl/videoUrl"
            }
        };
    },
    //取数据
    fetchData:function(url,params){
        return Api.httpGET(url,params);
    },
    //点击加载详情
    loadDetail:function(baseUrl,id,evt){

        evt.preventDefault();
        var winWidth = $(window).width();
        Api.httpGET(baseUrl+'/'+id,{}).done(function(payload){
            if(payload.code !== 200 || !payload.data) return;
            var pswpElement = document.querySelectorAll('.pswp')[0];

            var items = $.map(payload.data,function(v,i){
                var dimension = v.contentUrl && v.contentUrl.split(/_(\d{1,4})x(\d{1,4})\.\w+g$/i);
                var src = (window.Core.mode ==='dev')?v.contentUrl:v.contentUrl+'@1e_'+ winWidth+'w_1c_0i_1o_90q_1x';
                var w = dimension.length>2 ?parseInt(dimension[1]):-1;
                var h = dimension.length>2 ?parseInt(dimension[2]):-1;
                return {
                    src:src,
                    w:w,
                    h:h
                }
            })

            // define options (if needed)
            var options = {
                // optionName: 'option value'
                // for example:
                index: 0, // start at first slide
                history:false,
                focus: false
            };

            // Initializes and opens PhotoSwipe
            var gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
            gallery.init()
        });

    },

    componentWillMount : function() {
        //$('.pswp').css({display:'none'});

    },

    componentDidMount: function() {
        var self = this;
        var $screening_box = $('#screening_box');
        var $f4_hidden = $('#f4_hidden');
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

        $screening_box.on('click','.item',function(){
            $('.item',$screening_box).removeClass('item-current');
            $(this).addClass('item-current');
        });

        $f4_hidden.height($(window).height()-100);

        function scrollPos(box,cont){
            box.bind("scroll",function(){
                //console.log(box.scrollTop() + box.height() + "  , " + cont.height());
                if(box.scrollTop() + box.height() >= cont.height() && !window.Core.isFeching){
                    scrollFunc(self.state.baseUrl,{
                        pageSize:self.state.pageSize,
                        pageIndex:self.state.pageIndex
                    });
                }

            });
        }
        function scrollFunc(url,params) {
            //console.log(self.state.totalCount +" , "+ parseInt(self.state.pageSize)*parseInt(self.state.pageIndex));
            if(parseInt(self.state.totalCount)>0 &&
                parseInt(self.state.pageSize)*(parseInt(self.state.pageIndex) - 1) >parseInt(self.state.totalCount))
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
                    //console.log(payload);
                    $('#loaderIndicator').removeClass('isShow');
                })

        }

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
                        totalCount:parseInt(payload.totalCount)
                    });

                    //console.log(payload.totalCount);
                    // 绑上滚动加载。
                    scrollPos($("#f4_hidden"),$("#scroll_content"));

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

    screeningClick : function(url){
        var self = this;
        self.state.pageIndex = 1;
        var params = {
            pageSize: self.state.pageSize,
            pageIndex: self.state.pageIndex
        }

        self.fetchData(url,params)
            .done(function(payload){
                (payload.data && payload.code === 200) &&
                self.setState({
                    payload:payload.data,
                    pageIndex:parseInt(self.state.pageIndex)+1,
                    baseUrl:url,
                    totalCount:parseInt(payload.totalCount)
                })

                $("#f4_hidden").unbind('scroll');
                //console.log(payload);
                //console.log(JSON.stringify(payload.data,null,4));
                //console.log(self.state.baseUrl);
                self.scrollPos($("#f4_hidden"),$("#scroll_content"),params)
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
            if(box.scrollTop() + box.height() >= (cont.height() - 5) && !window.Core.isFeching){
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
                $('#loaderIndicator').removeClass('isShow');
                //console.log(payload.data);
            })
    },

    priceSort : function(obj){
        var self = this;
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
                    totalCount:payload.totalCount
                })
            })
    },

    saveData : function(data){
        var self = this;
        window.localStorage.clear();
        var storage = window.localStorage;

        if(data instanceof Array)for(var i in data) storage[i] = data[i];
        else storage.video = data;
    },

    render: function() {
        var self = this;
        var winWidth = $(window).width();
        var pageData = self.state.payload;
        var baseUrl = self.state.baseUrl;
        var srcArr = self.state.dataConf[baseUrl] !== undefined && self.state.dataConf[baseUrl].split('/');
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
                <WXHeaderMenu menuType={'menu_3'} name={3} />

                <div className='f4-list-view' id='scroll_box'>
                    <div className='screening-box' id='screening_box'>
                        <div className='item item-current'><span onClick={self.screeningClick.bind(self,'f4/host')}>主持人</span></div>
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
                                                                    <h3 className='title'>{v.personName}</h3>
                                                                    <div style={{display:'none'}}><i>+</i><span>关注</span></div>
                                                                </div>
                                                                <ul className='list-img clearfix'>
                                                                    {
                                                                        $.map(
                                                                            v[srcArr[0]] || [],
                                                                            function(vv,ii){
                                                                                return(
                                                                                    <li key={ii} onClick={self.saveData.bind(self,vv[srcArr[2]])}>
                                                                                        <ImageListItem frameWidth={winWidth} detailBaseUrl={baseUrl} sid={v.personId} url={vv[srcArr[1]]} />
                                                                                    </li>
                                                                                )
                                                                            }
                                                                        )
                                                                    }
                                                                </ul>
                                                                <div className='price-box'><strong>报价：</strong><span>￥</span><b>{v.skillPrice}</b></div>
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
