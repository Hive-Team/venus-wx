var React = require('react');
var PropTypes = React.PropTypes;
var Router = require('react-router-ie8');
var Api = require('../config/api.js');
var SKMap = require('../config/wx-skmap.js');
var ImageListItem = require('./image-item.js');

var WXDresserPhotographerDetail = React.createClass({
    mixins:[Router.State], //我们需要知道当前的path params 等等信息
    //初始化状态。
    // 分页，资源标示，数据，根路由，总条数， 风格类型
    getInitialState: function() {
        return {
            pageSize:6,
            pageIndex:1,
            tplKey:'list#sample',
            payload:[],
            baseUrl:'',
            totalCount:0
        };
    },
    fetchData:function(url,params){
        return Api.httpGET(url,params);
    },

    componentDidMount: function() {
        var $video_player = $('#video_player');

        //console.log($video_player.height());
        $video_player.css({marginTop:-$video_player.height()/2});
        $('.screening-box-wx').css({display:'none'});
    },

    componentWillUnmount : function(){
        $('.screening-box-wx').css({display:'block'});
        $('#video_player')[0].load();
        $('#video_player')[0].currentTime = 0;
        //console.log($('#video_player')[0].crossOrigin);
    },

    render: function() {
        return (
            <div className="video-player-view">
                <div style={{display:'none',position:'absolute',color:'#ffffff',zIndex:'100'}}>{window.localStorage.video}</div>
                <video controls='controls' name="media" id='video_player'>
                    <source src={window.localStorage.f4VideoData} type='video/mp4'/>
                </video>
            </div>
        );
    }

});

module.exports = WXDresserPhotographerDetail;
