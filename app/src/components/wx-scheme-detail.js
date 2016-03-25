var React = require('react');
var PropTypes = React.PropTypes;
var Router = require('react-router-ie8');
var Api = require('../config/api.js');
var SKMap = require('../config/wx-skmap.js');
var ImageListItem = require('./image-item.js');

var WXSchemeDetail = React.createClass({

    mixins:[Router.State], //我们需要知道当前的path params 等等信息
    getInitialState: function() {
        return {
            payload:[],
            imgList:[],
            totalCount:0,
            pageSize:4,
            pageIndex:1,
            baseUrl:'',
            tplKey:'list#scheme'
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
                //console.log(payload.data);
                (payload.code === 200) &&
                self.setState({
                    imgList:JSON.parse(payload.data.wxDetailImages),
                    payload:payload.data[0]
                })
            })
    },

    render: function() {
        var pageData = this.state.payload;
        var imgList = this.state.imgList;
        var winW = $(window).width();

        return (
            <div className="app ng-scope">
                <div className="app-body">
                    <div className="app-content">
                        <div className="scroll-able ng-scope">
                            <div className="scroll-able-content">
                                <section className="wedding-detail-box">
                                    <div className="case-detail-box">
                                        <div className="intro">
                                            <h2>作品诠释</h2>
                                            <p>{pageData.description + '测试数据啦啦啦啦啦啦啦'}</p>
                                        </div>
                                        {
                                            //<div className="person">
                                            //    <ul className="list-4-wxjs clearfix">
                                            //        <li className="item-box">
                                            //            <div className="box"><a
                                            //                className="avatar-box"><span>{pageData.theme}</span></a>
                                            //
                                            //                <div className="title"><h2><b>风格</b></h2></div>
                                            //            </div>
                                            //        </li>
                                            //        <li className="item-box" style={{display:'none'}}>
                                            //            <div className="box"><a
                                            //                href={'#/scheme/style/' + (pageData.length > 0 && pageData[0].schemeStyles[0].styleId)}
                                            //                className="avatar-box"><b><i>更多相似</i><br/><i>风格欣赏</i></b></a>
                                            //            </div>
                                            //        </li>
                                            //    </ul>
                                            //</div>
                                        }
                                        <div className="intro">
                                            <h2>主题属性</h2>
                                            <div className='content clearfix'>
                                                <div className='item'><span>主题：</span><span>大气</span></div>
                                                <div className='item'><span>风格：</span><span>飘起来</span></div>
                                                <div className='item'><span>色系：</span><span>紫色</span></div>
                                            </div>
                                        </div>
                                        <div className="intro">
                                            <h2>价格</h2>
                                            <div className='content clearfix'>
                                                <div className='price'><span>折后价：</span><strong>3799.00</strong></div>
                                                <div className='price'><span>原价：</span><strong>5999.00</strong></div>
                                                <div className='price item-full'><span>场景布置费用：</span><strong>5999.00</strong></div>
                                                <div className='price item-full'><span>婚礼人费用（主持人、造型师、摄影师、摄像师）：</span><strong>5999.00</strong></div>
                                            </div>
                                        </div>
                                        <div className="intro">
                                            <h2>现场欣赏</h2>
                                        </div>
                                    </div>
                                    <ul className="ul-box">
                                        {
                                            imgList.map(function(v,i){
                                                return (
                                                    <li className="item-box" key={i}>
                                                        <ImageListItem url={v.url} frameWidth={winW*2} mask={true} />
                                                    </li>
                                                )
                                            })
                                        }
                                    </ul>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        );
    }

});

module.exports = WXSchemeDetail;
