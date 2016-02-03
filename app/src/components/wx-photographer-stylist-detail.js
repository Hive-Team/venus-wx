var React = require('react');
var PropTypes = React.PropTypes;
var Router = require('react-router-ie8');
var Api = require('../config/api.js');
var SKMap = require('../config/wx-skmap.js');
var ImageListItem = require('./image-item.js');

var WXTeamDetail = React.createClass({
    mixins:[Router.State], //我们需要知道当前的path params 等等信息
    //初始化状态。
    // 分页，资源标示，数据，根路由，总条数， 风格类型
    getInitialState: function() {
        return {
            pageSize:50,
            pageIndex:1,
            payload:{},
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
            var params = {
                pageSize:self.state.pageSize,
                pageIndex:self.state.pageIndex,
                teamLevel:self.getParams().levelId
            }
            return Api.httpGET('team',params);
        };

        fetchData()
            .done(function(payload){

                (payload.code === 200) &&
                self.setState({
                    payload:payload.data[self.getParams().ind]
                },function(){
                    $('#slider_box').length>0 && $('#slider_box').Slider();
                });
                //console.log(payload.data[self.getParams().ind]);
            });
    },

    render: function() {
        var self = this;
        var pageData = self.state.payload;
        var baseUrl = self.getPath();
        //var conf_nav = ['简介','作品集'];

        return (
            <div className="photographer-stylist-detail-view" id='photographer_detail'>
                <div className='banner-box'>
                    <div className='bg-box'></div>
                    <div className='avatar-list'>
                        <div className='avatar-box'>
                            <img src={pageData.photographerDetail && pageData.photographerDetail.head} />
                            <span>{pageData.photographerDetail && pageData.photographerDetail.personName}</span>
                        </div>
                        <div className='avatar-box'>
                            <img src={pageData.stylistDetail && pageData.stylistDetail.head}/>
                            <span>{pageData.stylistDetail && pageData.stylistDetail.personName}</span>
                        </div>
                    </div>
                    <div className='team-name'><h1>{pageData.teamName}</h1></div>
                    <div className='info-box'>
                        <h1 className='title'>{}</h1>
                        <h2 className='job'>{pageData.ownedCompany}</h2>
                    </div>
                </div>
                <div className='title-2-wxjs' id='nav_box'>
                    <span className='item item-current'>作品集</span>
                </div>
                {
                    //<div className='title-2-wxjs' id='nav_box'>
                    //    {
                    //        $.map(conf_nav,
                    //            function (v, i) {
                    //                return (
                    //                    <span key={i} className={i === 0 && 'item item-current' || 'item'}>{v}</span>
                    //                )
                    //            })
                    //    }
                    //</div>
                }
                <div className='cont-box des-box' style={{display:'none'}}>
                    <div className='title' style={{display:'none'}}><span>擅长中国风</span><span>7年从业经验</span></div>
                    <p>{pageData.description}</p>
                </div>
                <ul className='cont-box list-img'>
                    {
                        $.map(pageData.workList || [],
                            function(v,i){
                                return(
                                    <li key={i}>
                                        <ImageListItem
                                            frameWidth={1000}
                                            detailBaseUrl={'/' + 'team' + '/' + pageData.teamId + '/works' }
                                            url={v.contentUrl}
                                            sid={v.contentId} />
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

module.exports = WXTeamDetail;
