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
            pageSize:50,
            pageIndex:1,
            payload1:[],
            payload2:[],
            baseUrl:'',
            teamLevel:1,
            nowCount:0,
            totalCount:0
        };
    },
    //取数据
    fetchData:function(url,params){
        return Api.httpGET(url,params);
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
                        teamLevel:self.state.teamLevel
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
                    if(self.state.teamLevel === 1){
                        (payload.data && payload.code === 200) &&
                        self.setState({
                            payload1:((self.state.pageIndex === 1)?payload.data : self.state.payload1.concat(payload.data)),
                            pageIndex:parseInt(self.state.pageIndex)+1,
                            totalCount:parseInt(payload.totalCount)
                        });
                    }else{
                        (payload.data && payload.code === 200) &&
                        self.setState({
                            payload2:((self.state.pageIndex === 1)?payload.data : self.state.payload2.concat(payload.data)),
                            pageIndex:parseInt(self.state.pageIndex)+1,
                            totalCount:parseInt(payload.totalCount)
                        });
                    }

                    console.log(payload.data);
                    self.lvlFunc(payload.totalCount);

                    //console.log(self.state.totalCount + " , " + self.state.nowCount);

                    window.Core.isFeching = false;
                    window.clearTimeout(timeout);
                    $('#loaderIndicator').removeClass('isShow');

                    ((self.state.teamLevel === 1) && scrollPos($("#scroll_box"),$("#scroll_content_s"))) || ($("#scroll_box").unbind('scroll') && scrollPos($("#scroll_box"),$("#scroll_content")));
                })
        }

        // 从菜单获取资源链接。
        var parseResource = function(){

            self.fetchData('team',
                {
                    pageSize:self.state.pageSize,
                    pageIndex:self.state.pageIndex,
                    teamLevel:self.state.teamLevel
                })
                .done(function(payload){
                    if(self.state.teamLevel === 1){
                        (payload.data && payload.code === 200) &&
                        self.setState({
                            payload1:((self.state.pageIndex === 1)?payload.data : self.state.payload.concat(payload.data)),
                            pageIndex:parseInt(self.state.pageIndex)+1,
                            baseUrl:'team',
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
                    //console.log(payload.data);

                    self.lvlFunc(payload.totalCount);
                    // 绑上滚动加载。

                    ((self.state.teamLevel === 1) && scrollPos($("#scroll_box"),$("#scroll_content_s"))) || ($("#scroll_box").unbind('scroll') && scrollPos($("#scroll_box"),$("#scroll_content")));

                })
        };

        $.when(window.Core.promises['/'])
            //.then(fetchStyle)
            .then(parseResource);
    },

    lvlFunc : function(total){
        this.state.nowCount += this.state.pageSize;

        if(this.state.nowCount >= total){
            if(this.state.teamLevel === 2)return;

            this.state.nowCount = 0;
            this.state.pageIndex = 1;
            this.state.teamLevel = 2;
        }
    },

    render: function() {
        var self = this;
        var pageData1 = self.state.payload1;
        var pageData2 = self.state.payload2;
        var baseUrl = self.state.baseUrl;

        return (
            <div className="app has-navbar-top">
                <WXHeaderMenu menuType={'menu_1'} name={3} />

                <div className='photographer-stylist-list-view' id='scroll_box'>
                    <div id='scroll_content' className='scroll-countent'>
                        <div className='scroll-countent' id='scroll_content_s'>
                            <div className='title-1-wxjs top-box'><h2 className='title'>{'总监级摄影团队'}</h2></div>
                            <ul className='photographer-stylist-list mgb10 clearfix'>
                                {
                                    $.map(
                                        pageData1 || [],
                                        function(v,i){
                                            return(
                                                <li className='list-item-5-wxjs' key={i}>
                                                    <a className='relative-box' href={'#/' + baseUrl  + '/' + v.teamLevel + '/' + i}>
                                                        <div className='content'>
                                                            <div className='person-box'>
                                                                <div className='avatar-box'><img src={v.photographerDetail.head} /></div>
                                                                <div className='info-box'>
                                                                    <span className='name'>{v.photographerDetail.personName}</span>
                                                                </div>
                                                            </div>
                                                            <div className='person-box'>
                                                                <div className='avatar-box'><img src={v.stylistDetail.head} /></div>
                                                                <div className='info-box'>
                                                                    <span className='name'>{v.stylistDetail.personName}</span>
                                                                </div>
                                                            </div>
                                                            <div className='team-box'>
                                                                <span className='team-name'>{v.teamName}</span>
                                                                <span className='detail'>查看详情</span>
                                                            </div>
                                                        </div>
                                                    </a>
                                                </li>
                                            )
                                        }
                                    )
                                }
                            </ul>
                        </div>
                        <div className='title-1-wxjs'><h2 className='title'>{'资深级摄影团队'}</h2></div>
                        <ul className='photographer-stylist-list bottom-box clearfix'>
                            {
                                $.map(
                                    pageData2 || [],
                                    function(v,i){
                                        return(
                                            <li className='list-item-5-wxjs' key={i}>
                                                <a className='relative-box' href={'#/' + baseUrl + '/' + v.teamLevel + '/' + i}>
                                                    <div className='content'>
                                                        <div className='team-box'>
                                                            <span className='team-name'>{v.teamName}</span>
                                                            <span className='detail'>查看详情</span>
                                                        </div>
                                                        <div className='person-box'>
                                                            <div className='avatar-box'><img src={v.photographerDetail.head} /></div>
                                                            <div className='info-box'>
                                                                <span className='name'>{v.photographerDetail.personName}</span>
                                                            </div>
                                                        </div>
                                                        <div className='person-box'>
                                                            <div className='avatar-box'><img src={v.stylistDetail.head} /></div>
                                                            <div className='info-box'>
                                                                <span className='name'>{v.stylistDetail.personName}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </a>
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
