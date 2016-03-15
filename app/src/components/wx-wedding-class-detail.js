var React = require('react');
var Router = require('react-router-ie8');
var Api = require('../config/api.js');

var WXWeddingClassDetail = React.createClass({
    mixins:[Router.State], //我们需要知道当前的path params 等等信息
    //初始化状态。
    // 分页，资源标示，数据，根路由，总条数， 风格类型
    getInitialState: function() {
        var self = this;

        return {
            pageSize:6,
            pageIndex:1,
            tplKey:'list#sample',
            payload:[],
            baseUrl:'',
            totalCount:0,
            router:self.getPath().substr(1)
        };
    },

    fetchData:function(url,params){
        return Api.httpGET(url,params);
    },

    componentDidMount: function() {
        var self = this;
        var router = self.state.router;
        var $weddingclass_content = $('#weddingclass_content');

        self.fetchData(router)
            .done(function(payload){
                (payload.data && payload.code === 200) && self.setState({
                    payload:payload.data[0]
                });

                //(payload.data && payload.code === 200) && console.log(payload.data);
            }
        );
    },

    render: function() {
        var self = this;
        var payload = self.state.payload || {};

        return (
            <div className="weddingclass-detail-view mobile-main-box">
                <h1 style={{display:'none'}}>{payload.title}</h1>
                <div style={{display:'none'}} className='info-box'><b>{'作者：'+payload.author}</b><span>{'时间：'+payload.publishTime}</span></div>
                <div className='content' dangerouslySetInnerHTML={{__html:payload.content}}></div>
            </div>
        );
    }

});

module.exports = WXWeddingClassDetail;
