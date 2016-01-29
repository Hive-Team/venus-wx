var React = require('react');
var PropTypes = React.PropTypes;
var Router = require('react-router-ie8');
var Api = require('../config/api.js');
var SKMap = require('../config/wx-skmap.js');
var ImageListItem = require('./image-item.js');
var WXHeaderMenu = require('./wx-header-menu.js');

var WXHotel = React.createClass({
    mixins:[Router.State], //我们需要知道当前的path params 等等信息
    //初始化状态。
    // 分页，资源标示，数据，根路由，总条数， 风格类型
    getInitialState: function() {
        return {
            pageSize:6,
            pageIndex:1,
            tplKey:'list#hotel',
            payload:[],
            baseUrl:'',
            totalCount:0,
            areas: [
                {
                    "id": 99,
                    "name": "渝北区"
                },
                {
                    "id": 94,
                    "name": "南岸区"
                },
                {
                    "id": 90,
                    "name": "渝中区"
                },{
                    "id": 92,
                    "name": "江北区"
                }, {
                    "id": 95,
                    "name": "九龙坡区"
                },{
                    "id": 100,
                    "name": "巴南区"
                },  {
                    "id": 91,
                    "name": "大渡口区"
                },  {
                    "id": 101,
                    "name": "北部新区"
                },{
                    "id": 96,
                    "name": "北碚区"
                }, {
                    "id": 93,
                    "name": "沙坪坝区"
                },
                {
                    "id": 114,
                    "name": "重庆近郊"
                }
            ]
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

    componentDidMount: function() {
        var self = this;
        var $nav_box = $('#nav_box');
        var $screening_list = $('#screening_list');

        $('.item',$nav_box).each(function(i,e){
            var ind = $(this).index();

            $(this).bind('click',function(){
                //console.log($('ul',$(this))[0].style.display);
                if($(this).hasClass('item-current') && $('ul',$nav_box)[ind].style.display != ('none' || '')){
                    $('ul',$nav_box).css({display:'none'});
                    return;
                }

                $('.item',$nav_box).removeClass('item-current');
                $(this).addClass('item-current');
                $('ul',$nav_box).css({display:'none'});
                $($('ul',$nav_box)[ind]).css({display:'block'});
            });
        });

        $('li',$nav_box).click(function(){
            $('li',$nav_box).removeClass('current');
            $(this).addClass('current').parent().css({display:'none'});
        });

        function scrollPos(box,cont){
            box.bind("scroll",function(){
                //console.log(box.scrollTop() + box.height(),cont.height());
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

        // 从菜单获取资源链接。
        var parseResource = function(obj){
            var pathArr = SKMap['#'+self.getPathname()].split('/');
            var resourceLinks = window.Core.resource;
            var params = {
                pageSize: self.state.pageSize,
                pageIndex: self.state.pageIndex
            }

            $.each(pathArr,function(k,v){
                resourceLinks = resourceLinks[v];
            });

            self.fetchData(resourceLinks.split('#')[1],params)
                .done(function(payload){
                    (payload.data && payload.code === 200) &&
                    self.setState({
                        payload:((self.state.pageIndex === 1)?payload.data : self.state.payload.concat(payload.data)),
                        pageIndex:parseInt(self.state.pageIndex)+1,
                        baseUrl:resourceLinks.split('#')[1],
                        totalCount:parseInt(payload.totalCount)
                    });

                    //console.log(JSON.stringify(payload.data,null,4));
                    //console.log(payload.totalCount);
                    // 绑上滚动加载。
                    scrollPos($("#scroll_box"),$("#scroll_content"));
                })
        };

        $.when(window.Core.promises['/'])
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
                //console.log(payload);
                //console.log(JSON.stringify(payload.data,null,4));
                //console.log(params);
                self.scrollPos($("#scroll_box"),$("#scroll_content"),params);
            })
    },

    scrollPos : function(box,cont,params){
      var self = this;
        if(!params) params = {
            pageSize:self.state.pageSize,
            pageIndex:self.state.pageIndex,
        }

        box.bind("scroll",function(){
            //console.log(box.scrollTop() + box.height() + " , " + (cont.height() + 80));
            if(box.scrollTop() + box.height() >= cont.height() + 80 && !window.Core.isFeching){
                // console.log(params);
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

    render : function() {
        var self = this;
        var winWidth = $(window).width();
        var pageData = self.state.payload;

        return (
            <div className='hotel-list-view mobile-main-box'>
                <WXHeaderMenu menuType={'menu_2'} name={0} />
                <div className="hotel-list">
                    <div className='nav-box' id='nav_box'>
                        <span className='item'>位置</span>
                        <span className='item'>桌数</span>
                        <span className='item'>价格</span>
                        <span className='item' onClick={function(){self.screeningClick(self.state.baseUrl,{isGift:1})}}>礼包</span>
                        <span className='item' onClick={function(){self.screeningClick(self.state.baseUrl,{isDisaccount:1})}}>优惠</span>

                        <ul className='clearfix'>
                            <li onClick={function(){self.screeningClick(self.state.baseUrl)}}>全部</li>
                            {
                                $.map(self.state.areas,function(v,i){
                                    return(
                                        <li key={i} onClick={function(){self.screeningClick(self.state.baseUrl,{cityId:v['id']})}}>{v['name']}</li>
                                    )
                                })
                            }
                        </ul>
                        <ul className='clearfix'>
                            <li onClick={function(){self.screeningClick(self.state.baseUrl,{minTable:0})}}>全部</li>
                            <li onClick={function(){self.screeningClick(self.state.baseUrl,{maxTable:9})}}>10桌以下</li>
                            <li onClick={function(){self.screeningClick(self.state.baseUrl,{minTable:10,maxTable:20})}}>10-20桌</li>
                            <li onClick={function(){self.screeningClick(self.state.baseUrl,{minTable:20,maxTable:30})}}>20-30桌</li>
                            <li onClick={function(){self.screeningClick(self.state.baseUrl,{minTable:30,maxTable:40})}}>30-40桌</li>
                            <li onClick={function(){self.screeningClick(self.state.baseUrl,{minTable:40,maxTable:50})}}>40-50桌</li>
                            <li onClick={function(){self.screeningClick(self.state.baseUrl,{minTable:51})}}>50桌以上</li>
                        </ul>
                        <ul className='clearfix'>
                            <li onClick={function(){self.screeningClick(self.state.baseUrl,{minPrice:0})}}>全部</li>
                            <li onClick={function(){self.screeningClick(self.state.baseUrl,{maxPrice:1999})}}>2000元以下</li>
                            <li onClick={function(){self.screeningClick(self.state.baseUrl,{minPrice:2000,maxPrice:3000})}}>2000-3000元</li>
                            <li onClick={function(){self.screeningClick(self.state.baseUrl,{minPrice:3000,maxPrice:4000})}}>3000-4000元</li>
                            <li onClick={function(){self.screeningClick(self.state.baseUrl,{minPrice:4001})}}>4000元以上</li>
                        </ul>

                        <div className='line-bottom'></div>
                    </div>
                    <div className='scroll-box scroll-padding-100'>
                        <div className='hidden-box'>
                            <div className='scroll-view' id='scroll_box'>
                                <div className='list-view' id='scroll_content'>
                                    <ul className='hotel-screening-list' id='screening_list' style={{display:'none'}}>
                                        <li>
                                            <div className='item-box input-box'><i className='ico-magnifier'></i><input type='text' /><span>搜索</span></div>
                                        </li>
                                    </ul>
                                    <ul className='list-hotel'>
                                        {
                                            $.map(pageData || [],function(v,i){
                                                return(
                                                    <li key={i} className='list-item-2-wxjs'>
                                                        <a href={'#/'+self.state.baseUrl+'/'+ v.hotelId} className='relative-box'>
                                                            <div className='img-box'><img src={v.imageUrl} /></div>
                                                            <div className='info-box'>
                                                                <div className='title-box'><h1 className='title'>{v.hotelName}</h1><i className='block-blue-1-wxjs' style={{display:v.isGift?'block':'none'}}>礼</i><i className='block-red-1-wxjs' style={{display:v.isDiscount?'block':'none'}}>惠</i></div>
                                                                <div className='score-box'>
                                                                    <div className='star-box' style={{display:'none'}}><i className='ico-star-1-js ico-star-1-gray-js'></i><i className='ico-star-1-js ico-star-1-pink-js' style={{width:'35px'}}></i></div>
                                                                    <b className='red-1-wxjs' style={{display:'none'}}>3.5</b><span className='gray-1-wxjs'>{v.typeName}</span>
                                                                </div>
                                                                <div className='desk-box'>
                                                                    <strong>桌数：</strong><b className='red-1-wxjs'>{v.banquetHallCount}</b><span className='gray-1-wxjs'>个大厅，</span><span className='gray-1-wxjs'>容纳</span><b className='red-1-wxjs'>{v.capacityPerTable}</b><span className='gray-1-wxjs'>桌</span>
                                                                </div>
                                                                <div className='addr-box'><strong>位置：</strong><span className='gray-1-wxjs'>{v.address}</span></div>
                                                                <div className='price-box'>
                                                                    <b className='red-1-wxjs'>￥</b><b className='red-1-wxjs big'>{v.lowestConsumption}</b><b className='red-1-wxjs'>-</b><b className='red-1-wxjs big'>{v.highestConsumption}</b>
                                                                </div>
                                                            </div>
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
                    </div>
                </div>
            </div>
        );
    }

});

module.exports = WXHotel;
