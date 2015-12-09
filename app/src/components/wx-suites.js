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
            pageSize:6,
            pageIndex:1,
            tplKey:'list#pringles',
            payload:[],
            baseUrl:'',
            totalCount:0
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
        // 从菜单获取资源链接。
        var parseResource = function(){
            var pathArr = SKMap['#'+self.getPathname()].split('/');
            var resourceLinks = window.Core.resource;

            $.each(pathArr,function(k,v){
                resourceLinks = resourceLinks[v];
            });
            //console.log(resourceLinks.split('#')[1]);

            self.fetchData(resourceLinks.split('#')[1],
                {
                    pageSize:self.state.pageSize,
                    pageIndex:self.state.pageIndex
                })
                .done(function(payload){
                    (payload.data && payload.code === 200) &&
                    self.setState({
                        payload:((self.state.pageIndex === 1)?payload.data : self.state.payload.concat(payload.data)),
                        pageIndex:parseInt(self.state.pageIndex)+1,
                        baseUrl:resourceLinks.split('#')[1],
                        totalCount:parseInt(payload.totalCount)
                    });

                    //console.log(payload.totalCount);
                    // 绑上滚动加载。
                    scrollPos($("#scroll_box"),$("#scroll_content"));
                })
        };

        $.when(window.Core.promises['/'])
            .then(parseResource);
    },


    render: function() {
        var self = this;
        var winWidth = $(window).width();
        var pageData = self.state.payload;
        var baseUrl = self.state.baseUrl;
        return (
            <div className="app has-navbar-top">
                <WXHeaderMenu menuType={'menu_1'} name={2} />

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
                                                           <h1 className='title'>{v.productName}</h1>
                                                           <span className='subtitle'>{'（' + v.dressModeling + '）'}</span>
                                                       </div>
                                                       <div className='img-box relative-box'>
                                                           <a className='href-box' href={'#/'+baseUrl+'/'+ v.productId}></a>
                                                           <ImageListItem frameWidth={winWidth} url={v.imageUrl} />
                                                       </div>
                                                       <div className='info-box'>
                                                           <div className='containor clearfix'>
                                                               <div className='price'>
                                                                   <span className='red-1-wxjs'>￥</span><span className='red-1-wxjs big'>{(v.price).toFixed(2)}</span><b className='gray-1-wxjs'>定金</b><b className='gray-1-wxjs'>{'￥' + v.deposit}</b>
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
