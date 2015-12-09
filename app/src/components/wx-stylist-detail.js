var React = require('react');
var PropTypes = React.PropTypes;
var Router = require('react-router-ie8');
var Api = require('../config/api.js');
var SKMap = require('../config/wx-skmap.js');
var ImageListItem = require('./image-item.js');

var WXStylistDetail = React.createClass({
    mixins:[Router.State], //我们需要知道当前的path params 等等信息
    //初始化状态。
    // 分页，资源标示，数据，根路由，总条数， 风格类型
    getInitialState: function() {
        return {
            pageSize:6,
            pageIndex:1,
            payload:[],
            baseUrl:'',
            totalCount:0
        };
    },
    fetchData:function(url,params){
        return Api.httpGET(url,params);
    },
    componentDidMount: function() {
        var self = this;
        var $photographer_detail = $('#photographer_detail');
        var $nav_box = $('#nav_box');

        $nav_box.on('click','span',function(){
            var ind = $(this).index();

            $('span',$nav_box).removeClass('item-current');
            $('.cont-box',$photographer_detail).css({display:'none'});
            $(this).addClass('item-current');
            $($('.cont-box',$photographer_detail)[ind]).css({display:'block'});
        });

        var fetchData = function(){
            var url = self.getPath();
            return Api.httpGET(url,{});
        };

        fetchData()
            .done(function(payload){

                (payload.code === 200) &&
                self.setState({
                    payload:payload.data[0]
                },function(){
                    $('#slider_box').length>0 && $('#slider_box').Slider();
                });
                console.log(self.state.payload);
            });
    },

    render: function() {
        var self = this;
        var winWidth = $(window).width();
        var pageData = self.state.payload;
        var baseUrl = self.getPath();
        var conf_nav = [];

        pageData.level === '总监' && conf_nav.push('简介');
        pageData.list && conf_nav.push('相册');

        return (
            <div className="photographer-stylist-detail-view" id='photographer_detail'>
                <div className='banner-box'>
                    <div className='bg-box'></div>
                    <div className='avatar-box'><img src={pageData.photoUrl} /></div>
                    <div className='info-box'>
                        <h1 className='title'>{pageData.personName}</h1>
                        <h2 className='job'>{pageData.ownedCompany}</h2>
                    </div>
                </div>
                <div className={pageData.level === '总监' && 'title-2-wxjs' || 'title-2-wxjs title-2-1-wxjs'} id='nav_box'>
                    {
                        $.map(conf_nav,
                            function(v,i){
                                return(
                                    <span key={i} className={i === 0 && 'item item-current' || 'item'}>{v}</span>
                                )
                            })
                    }
                </div>
                <div className='cont-box des-box' style={{display:pageData.level !== '总监' && 'none'}}>
                    <div className='title' style={{display:'none'}}><span>擅长中国风</span><span>7年从业经验</span></div>
                    <p>{pageData.description}</p>
                </div>
                <ul className='cont-box list-img' style={{display:pageData.level === '总监' && 'none'}}>
                    {
                        $.map(pageData.list || [],
                            function(v,i){
                                return(
                                    <li key={i}><ImageListItem detailBaseUrl={baseUrl} url={v.contentUrl} sid={v.contentId} /></li>
                                )
                            }
                        )
                    }
                </ul>
            </div>

        );
    }

});

module.exports = WXStylistDetail;
