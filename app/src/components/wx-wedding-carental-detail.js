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
            sliderList:[],
            parameter:[],
            currentCard:0,
            scrollTop:0,
            isMenuRender:true
        };
    },

    fetchData:function(url,params){
        return Api.httpGET(url,params);
    },

    _clickBack : function(){
        var last;
        var $glob_back = $('#glob_detail_back');

        window.historyStates.isBack = true;
        last = window.historyStates.states.length - 1;
        window.historyStates.states[last].isMenuRender = true;
        $glob_back.off('click');

        window.history.back();
    },

    componentDidMount: function() {
        var self = this;
        var $slider_suite = $('#slider_hotel_detail');
        var winW = $(window).width()
        var $glob_back = $('#glob_detail_back');

        window.historyStates.states.length >= 1 && $glob_back.css({display:'block'});
        $glob_back.on('click',function(){
            self._clickBack();
        });

        var fetchData = function(url){
            return Api.httpGET(url,{});
        };
        var advUrl = self.getPath().substr(1).split('/')[0] === 'weddingsupplies' ? 'supplies' : 'car';

        $slider_suite.height(winW);

        fetchData(self.getPath().substr(1))
            .done(function(payload){
                console.log(payload.data);
                (payload.code === 200) &&
                self.setState({
                    payload:payload.data,
                    parameter:payload.data.parameter.split('|')
                });
            });

        fetchData('adv/' + advUrl + '_top')
            .done(function(payload){
                //console.log(payload.data);
                (payload.code === 200) &&
                self.setState({
                    sliderList:payload.data
                },function(){
                    $('#slider_box').length>0 && $('#slider_box').Slider({displayBtn:true,time:5000,device:'mobile'});
                });
            });
    },

    render: function() {
        var self = this;
        var winWidth = $(window).width();
        var sliderList = self.state.sliderList;
        var pageData = self.state.payload;
        var parameter = self.state.parameter;

        return (
            <div className="hotel-detail-view" id='hotel_detail_view'>
                <div className="hotel-detail-banner responsive-box" id="slider_box">
                    <div id="slider_hotel_detail" className="slider-box slider-box-1-js responsive-box">
                        <ul className="slider">
                            {
                                $.map(
                                    sliderList
                                    ,function(v,i){
                                        return (
                                            <li className='item transition-opacity-1' key={i}>
                                                <ImageListItem
                                                    frameWidth={winWidth*2}
                                                    url={v.coverUrlWx}
                                                    errorUrl={'http://placehold.it/375x250'}
                                                    mask={true}
                                                    />
                                            </li>
                                        )
                                    })
                            }
                        </ul>
                        <div className='point-box'>
                            {
                                $.map(
                                    sliderList
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
                <div className='car-info-box mgb10' dangerouslySetInnerHTML={{__html:pageData.content}}></div>
            </div>

        );
    }

});

module.exports = WXWeddingCarRentalDetail;
