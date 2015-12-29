var React = require('react');
var PropTypes = React.PropTypes;
var Router = require('react-router-ie8');
var Api = require('../config/api.js');
var SKMap = require('../config/wx-skmap.js');
var ImageListItem = require('./image-item.js');

var WXPringlesList = React.createClass({
    mixins:[Router.State], //我们需要知道当前的path params 等等信息
    //初始化状态。
    // 分页，资源标示，数据，根路由，总条数， 风格类型
    getInitialState: function() {
        return {
            pageSize:6,
            pageIndex:1,
            tplKey:'list#suite',
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
        var $suite_view = $('#suite_view');
        var $slider_suite = $('#slider_suite');
        var $nav_conts = $('#nav_box .cont');
        var $discription_box = $('#discription_box');
        var $nav_box = $('#nav_box');
        var winW = $(window).width();
        var fetchData = function(){
            var url = self.getPath();
            return Api.httpGET(url,{});
        };

        $slider_suite.height(2*winW/3);

        fetchData()
            .done(function(payload){

                (payload.code === 200) &&
                self.setState({
                    payload:payload.data[0]
                },function(){
                    $('#slider_box').length>0 && $('#slider_box').Slider();
                });
                console.log(self.state.payload);
            })

        $nav_conts.each(function(i){
            $(this).bind('click',function(){
                $nav_conts.removeClass('current');
                $(this).addClass('current');
                $('.cont',$discription_box).removeClass('current');
                $($('.cont',$discription_box)[i]).addClass('current');
            });
        });

        $suite_view.bind('scroll',function(){
            $(this).scrollTop() > 105 + $slider_suite.height() && $nav_box.css({position:'fixed'}) || $nav_box.css({position:'static'});
        });
    },

    render: function() {
        var self = this;
        var winWidth = $(window).width();
        var pageData = self.state.payload;
        var baseUrl = self.state.baseUrl;
        var navCont = ['详情','服务','服装','化妆品','景点','流程'];
        var subTit = ['可自选摄影师','可自选造型师','可自选摄影师／造型师','不可自选摄影师／造型师'];
        var imgArr = ['detailImages','serviceImages','clothShootImages','cosmeticImages','baseSampleImages','processImages'];

        var topSliderData = self.state.payload.slidesImages || [];
        //console.log(topSliderData);
        return (
            <div className="suite-view" id='suite_view'>
                <div className="suite-banner responsive-box" id="slider_box">
                    <div id="slider_suite" className="slider-box-1-js responsive-box">
                        <ul className="slider">
                            {
                                $.map(
                                    topSliderData
                                    ,function(v,i){
                                        return (
                                            <li className="item transition-opacity-1" key={i}>
                                                <ImageListItem
                                                    frameWidth={winWidth*2}
                                                    url={v.imageUrl}
                                                    errorUrl={'http://placehold.it/375x250'}
                                                    />
                                            </li>
                                        )
                                    })
                            }
                        </ul>
                        <div className='slider-point-box'>
                            {
                                $.map(
                                    topSliderData
                                    ,function(v,i){
                                        return (
                                            <i key={i} className='point'></i>
                                        )
                                    })
                            }
                        </div>
                    </div>
                </div>
                <div className='title-box clearfix'>
                    <h1 className='title'>{pageData.productName}</h1>
                    <h2 className='subtitle'>
                        {pageData.isOptionalCameraman === 1 && pageData.isOptionalStylist === 1 && subTit[2]
                        || pageData.isOptionalCameraman === 1 && subTit[0]
                        || pageData.isOptionalStylist === 1 && subTit[1]
                        || subTit[3]}
                    </h2>
                </div>
                <div className='price-box'>
                    <span className='red-1-wxjs'>¥</span><span className='red-1-wxjs big'>{pageData.price + '.00'}</span>
                    <b className='gray-1-wxjs'>定金</b><b className='gray-1-wxjs'>{'¥' + pageData.deposit}</b>
                </div>
                <div className='nav'>
                    <div className='nav-box' id='nav_box'>
                        {
                            $.map(navCont,function(v,i){
                                return(
                                    <span key={i} className='item'><span className={i === 0 && 'cont current' || 'cont'}>{v}</span></span>
                                )
                            })
                        }
                    </div>
                </div>
                <div className='discription-box' id='discription_box'>
                    <div className='cont current'>
                        {
                            $.map(imgArr, function(v,i){
                                return(
                                    $.map(pageData[imgArr[i]] || [],function(vv,ii){
                                        return(
                                            <ImageListItem
                                                key={i+'.'+ii}
                                                frameWidth={winWidth*2}
                                                url={vv.imageUrl}
                                                errorUrl={'http://placehold.it/375x250'}
                                                />
                                        )
                                    })
                                )
                            })
                        }
                    </div>
                    {
                        $.map(imgArr, function(v,i){
                            if(i !== 0){
                                return(
                                    <div key={i} className='cont'>
                                        {
                                            $.map(pageData[imgArr[i]] || [],function(vv,ii){
                                                return(
                                                    <ImageListItem
                                                        key={i+'.'+ii}
                                                        frameWidth={winWidth*2}
                                                        url={vv.imageUrl}
                                                        errorUrl={'http://placehold.it/375x250'}
                                                        />
                                                )
                                            })
                                        }
                                    </div>
                                )
                            }
                        })
                    }
                </div>
                <div className='btn-fixed-bottom-box' style={{display:'none'}}>
                    <div className='btn'><span>加入收藏</span></div><div className='btn'><span>立即抢购</span></div>
                </div>
            </div>

        );
    }

});

module.exports = WXPringlesList;
