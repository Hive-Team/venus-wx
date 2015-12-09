var React = require('react');
var PropTypes = React.PropTypes;
var Router = require('react-router-ie8');
var Api = require('../config/api.js');
var SKMap = require('../config/wx-skmap.js');
var ImageListItem = require('./image-item.js');

var WXPlannerDetail = React.createClass({
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

        var fetchData = function(){
            var url = self.getPath().substr(1);
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
                console.log(self.state.payload)
            });
    },

    render: function() {
        var self = this;
        var winWidth = $(window).width();
        var pageData = self.state.payload;
        var baseUrl = self.getPath();

        return (
            <div className="photographer-stylist-detail-view" id='photographer_detail'>
                <div className='banner-box'>
                    <div className='bg-box'></div>
                    <div className='avatar-list planner-avatar-list'>
                        <div className='avatar-box'>
                            <img src={pageData && pageData.photoUrl} />
                            <span>{pageData.photographerDetail && pageData.photographerDetail.personName}</span>
                        </div>
                    </div>
                    <div className='info-box'>
                        <h1 className='title'>{pageData.plannerName}</h1>
                        <h2 className='job'>{pageData.ownedCompany}</h2>
                    </div>
                </div>
                <div className='title-2-wxjs' id='nav_box'>
                    <span className='item item-current'>作品集</span>
                </div>
                <div className='cont-box des-box' style={{display:'none'}}>
                    <div className='title' style={{display:'none'}}><span>擅长中国风</span><span>7年从业经验</span></div>
                    <p>{pageData.description}</p>
                </div>
                <ul className='cont-box list-img'>
                    {
                        $.map(pageData.list || [],
                            function(v,i){
                                return(
                                    <li key={i}>
                                        <a href={'#/planner/' + pageData.plannerId + '/works'}><img src={v.contentUrl} /></a>
                                    </li>
                                )
                            }
                        )
                    }
                </ul>
            </div>
        );
    }
});

module.exports = WXPlannerDetail;
