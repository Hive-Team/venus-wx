var React = require('react');
var PropTypes = React.PropTypes;
var Router = require('react-router-ie8');
var Api = require('../config/api.js');
var SKMap = require('../config/wx-skmap.js');
var ImageListItem = require('./image-item.js');
var WXHeaderMenu = require('./wx-header-menu.js');

var WXPhotoGrapherStylistList = React.createClass({
    mixins:[Router.State], //我们需要知道当前的path params 等等信息
    //初始化状态。
    // 分页，资源标示，数据，根路由，总条数， 风格类型
    getInitialState: function() {
        return {
            pageSize:6,
            pageIndex:1,
            payload1:[],
            payload2:[],
            baseUrl:'',
            levelId:1,
            nowCount:0,
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
            });

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
            gallery.init();
        });

    },

    componentDidMount: function() {
        var self = this;
        var $img_box = $('#img_box');

        $('li',$img_box).each(function(i,e){
            $(e).height($(e).width()*2/3);
        });

        function scrollPos(box,cont){
            box.bind("scroll",function(){
                if(box.scrollTop() + box.height() >= cont.height() && !window.Core.isFeching){
                    scrollFunc(self.state.baseUrl,{
                        pageSize:self.state.pageSize,
                        pageIndex:self.state.pageIndex,
                        levelId:self.state.levelId
                    });
                }
            });
        }
        function scrollFunc(url,params) {
            //console.log(self.state.totalCount + " , " + parseInt(self.state.pageSize)*parseInt(self.state.pageIndex - 1) + " , " + self.state.nowCount);

            if(parseInt(self.state.totalCount)>0 &&
                parseInt(self.state.pageSize)*parseInt(self.state.pageIndex - 1) >= parseInt(self.state.totalCount))
                return;

            $('#loaderIndicator').addClass('isShow');
            window.Core.isFeching = true;
            var timeout = window.setTimeout(function(){
                window.Core.isFeching = false;
            },5000);
            self.fetchData(url,params)
                .done(function(payload){
                    if(self.state.levelId === 1){
                        (payload.data && payload.code === 200) &&
                        self.setState({
                            payload1:((self.state.pageIndex === 1)?payload.data : self.state.payload1.concat(payload.data)),
                            pageIndex:parseInt(self.state.pageIndex)+1
                        });
                    }else{
                        (payload.data && payload.code === 200) &&
                        self.setState({
                            payload2:((self.state.pageIndex === 1)?payload.data : self.state.payload2.concat(payload.data)),
                            pageIndex:parseInt(self.state.pageIndex)+1,
                            totalCount:parseInt(payload.totalCount)
                        });
                    }

                    //console.log(self.state.totalCount);
                    self.lvlFunc(payload.totalCount);

                    window.Core.isFeching = false;
                    window.clearTimeout(timeout);
                    $('#loaderIndicator').removeClass('isShow');

                    ((self.state.levelId === 1) && scrollPos($("#scroll_box"),$("#scroll_content_s"))) || ($("#scroll_box").unbind('scroll') && scrollPos($("#scroll_box"),$("#scroll_content")));

                    //console.log(JSON.stringify(payload.data,null,4));
                })
        }
        // 从菜单获取资源链接。
        var parseResource = function(){
            var baseurl = self.getPath().split('/')[1];
            console.log(baseurl);

            self.fetchData(baseurl,
                {
                    pageSize:self.state.pageSize,
                    pageIndex:self.state.pageIndex,
                    levelId:self.state.levelId
                })
                .done(function(payload){
                    if(self.state.levelId === 1){
                        (payload.data && payload.code === 200) &&
                        self.setState({
                            payload1:((self.state.pageIndex === 1)?payload.data : self.state.payload.concat(payload.data)),
                            pageIndex:parseInt(self.state.pageIndex)+1,
                            baseUrl:baseurl,
                            totalCount:parseInt(payload.totalCount)
                        });
                    }else{
                        (payload.data && payload.code === 200) &&
                        self.setState({
                            payload2:((self.state.pageIndex === 1)?payload.data : self.state.payload.concat(payload.data)),
                            pageIndex:parseInt(self.state.pageIndex)+1,
                            baseUrl:baseurl,
                            totalCount:parseInt(payload.totalCount)
                        });
                    }

                    self.lvlFunc(payload.totalCount);

                    //console.log(JSON.stringify(payload.data,null,4));
                    // 绑上滚动加载。

                    ((self.state.levelId === 1) && scrollPos($("#scroll_box"),$("#scroll_content_s"))) || ($("#scroll_box").unbind('scroll') && scrollPos($("#scroll_box"),$("#scroll_content")));

                })
        };

        $.when(window.Core.promises['/'])
            //.then(fetchStyle)
            .then(parseResource);
    },

    lvlFunc : function(total){
        this.state.nowCount += this.state.pageSize;

        if(this.state.nowCount >= total){
            if(this.state.levelId === 2)return;

            this.state.nowCount = 0;
            this.state.pageIndex = 1;
            this.state.levelId = 2;
        }
    },

    selStyle : function(id){
        var self = this;
        self.fetchData(self.state.baseUrl,{
            pageIndex:1,
            pageSize:self.state.pageSize,
            styleId:id
        }).done(function(payload){
            (payload.data && payload.code===200)&&
            self.setState({
                pageIndex:1,
                styleId:id,
                payload:payload.data,
                totalCount:payload.totalCount
            })
        })
    },


    render: function() {
        var self = this;
        var winWidth = $(window).width();
        var pageData1 = self.state.payload1;
        var pageData2 = self.state.payload2;
        var baseUrl = self.state.baseUrl;

        return (
            <div className="app has-navbar-top">
                <WXHeaderMenu menuType={'menu_1'} name={'造型师'} />

                <div className='photographer-stylist-list-view' id='scroll_box'>
                    <div id='scroll_content' className='scroll-countent'>
                        <div className='scroll-countent' id='scroll_content_s'>
                            <div className='title-1-wxjs top-box'><h2 className='title'>{'总监级造型师'}</h2></div>
                            <ul className='photographer-stylist-list mgb10 clearfix'>
                                {
                                    $.map(
                                        pageData1 || [],
                                        function(v,i){
                                            return(
                                                <li className='list-item-5-wxjs' key={i}>
                                                    <a className='relative-box' href={'#/' + baseUrl + '/' + v.personId}>
                                                        <div className='avatar-box'><img src={v.photoUrl} /></div>
                                                        <div className='info-box'>
                                                            <span className='name'>{v.personName}</span>
                                                            <p className='info'>{v.ownedCompany}</p>
                                                        </div>
                                                        <span className='photo-detail'>查看详情</span>
                                                    </a>
                                                </li>
                                            )
                                        }
                                    )
                                }
                            </ul>
                        </div>
                        <div className='title-1-wxjs'><h2 className='title'>{'资深造型师'}</h2></div>
                        <ul className='photographer-stylist-list bottom-box clearfix'>
                            {
                                $.map(
                                    pageData2 || [],
                                    function(v,i){
                                        return(
                                            <li className='list-item-6-wxjs' key={i}>
                                                <div className='avatar-box'><img src={v.photoUrl} /></div>
                                                <div className='info-box'>
                                                    <div className='title-box'>
                                                        <h3 className='title'>{v.personName}</h3>
                                                        <div style={{display:'none'}}><i>+</i><span>关注</span></div>
                                                    </div>
                                                    <ul className='list-img clearfix'>
                                                        {
                                                            $.map(
                                                                v.list,
                                                                function(vv,ii){
                                                                    return(
                                                                        <li key={ii}>
                                                                            <a href={'#' + baseUrl +'/' + v.personId}>
                                                                                <img src={vv.contentUrl + '@1e_'+ winWidth + 'w_' +'1c_0i_1o_90q_1x'} />
                                                                            </a>
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
                    <div id="loaderIndicator" className="btn-more"><span id="loading-info">正在加载... ...</span></div>
                </div>
            </div>

        );
    }

});

module.exports = WXPhotoGrapherStylistList;
