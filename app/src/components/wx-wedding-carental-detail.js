var React = require('react');
var PropTypes = React.PropTypes;
var Router = require('react-router-ie8');
var Api = require('../config/api.js');
var SKMap = require('../config/wx-skmap.js');
var ImageListItem = require('./image-item.js');

var WXWeddingCarRentalDetail = React.createClass({
    mixins:[Router.State], //我们需要知道当前的path params 等等信息
    //初始化状态。
    // 分页，资源标示，数据，根路由，总条数， 风格类型
    getInitialState: function() {
        return {
            pageSize:6,
            pageIndex:1,
            payload:'',
            baseUrl:'',
            totalCount:0,
            parameter:[]
        };
    },
    fetchData:function(url,params){
        return Api.httpGET(url,params);
    },
    componentDidMount: function() {
        var self = this;
        var $slider_suite = $('#slider_hotel_detail');
        var winW = $(window).width()
        var fetchData = function(){
            var url = self.getPath().substr(1);
            return Api.httpGET(url,{});
        };
        $slider_suite.height(winW);

        fetchData()
            .done(function(payload){
                //console.log(payload.data);
                (payload.code === 200) &&
                self.setState({
                    payload:payload.data,
                    parameter:payload.data.parameter.split('|')
                },function(){
                    $('#slider_box').length>0 && $('#slider_box').Slider();
                });
            });
    },

    render: function() {
        var self = this;
        var winWidth = $(window).width();
        var pageData = self.state.payload;
        var parameter = self.state.parameter;
        var baseUrl = self.state.baseUrl;
        parameter.pop();

        return (
            <div className="hotel-detail-view" id='hotel_detail_view'>
                <div className="hotel-detail-banner responsive-box" id="slider_box">
                    <div id="slider_hotel_detail" className="slider-box-1-js responsive-box">
                        <ul className="slider">
                            {
                                $.map(
                                    pageData.detailPics || []
                                    ,function(v,i){
                                        return (
                                            <li className="item transition-opacity-1" key={i}>
                                                <ImageListItem
                                                    frameWidth={winWidth}
                                                    url={v}
                                                    detailBaseUrl={baseUrl}
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
                                    pageData.detailPics || []
                                    ,function(v,i){
                                        return (
                                            <i key={i} className='point'></i>
                                        )
                                    })
                            }
                        </div>
                    </div>
                </div>
                <div className='title-box car-detail-title mgb10 clearfix'>
                    <h1 className='title'>{pageData.title}</h1>
                </div>
                <div className='info-box info-car-box mgb10 clearfix'>
                    {
                        $.map(parameter || [],function(v,i){
                            return(
                                <span key={i}>{v}</span>
                            )
                        })
                    }
                </div>
                <div className='car-info-box mgb10' dangerouslySetInnerHTML={{__html:pageData.detail}}></div>
            </div>

        );
    }

});

module.exports = WXWeddingCarRentalDetail;
