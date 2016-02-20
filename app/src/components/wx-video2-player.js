var React = require('react');
var PropTypes = React.PropTypes;
var Router = require('react-router-ie8');
var Api = require('../config/api.js');
var SKMap = require('../config/wx-skmap.js');
var ImageListItem = require('./image-item.js');

var WXVideoPlayer = React.createClass({
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
        var self = this;
        var router = self.getPath().substr(1);
        var $video_player = $('#video_player');
        var proportion = 0.5;
        var winW = $(window).width();
        var vH = proportion * winW;

        $('.screening-box-wx').css({display:'none'});

        //console.log($video_player.height());
        $video_player.css({marginTop:-vH/2});

        self.fetchData(router)
            .done(function(payload){
                (payload.data && payload.code === 200) && self.setState({
                    payload:payload.data
                });

                //(payload.data && payload.code === 200) && console.log(payload.data);
            }
        );
    },

    componentWillUnmount : function(){
        $('.screening-box-wx').css({display:'block'});
        $('#video_player')[0].load();
        $('#video_player')[0].currentTime = 0;
        //console.log($('#video_player')[0].crossOrigin);
    },

    render: function() {
        var self = this;
        var videoData = self.state.payload || {};

        if(videoData.videoUrl != null)return (
            <div className="video-player-view">
                <video controls='controls' name="media" id='video_player'>
                    <source src={videoData.videoUrl} type='video/mp4'/>
                </video>
            </div>
        )
        else return (
            <div className="video-player-view">
                <video controls='controls' name="media" id='video_player' ></video>
            </div>
        )

    }

});

module.exports = WXVideoPlayer;
