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
                    payload:payload.data
                })
            })
    },

    render: function() {
        var pageData = this.state.payload;
        var winW = $(window).width();

        return (

            <div className="app ng-scope">
                <div className="app-body">
                    <div className="app-content">
                        <div className="scroll-able ng-scope">
                            <div className="scroll-able-content">
                                <section className="wedding-detail-box">
                                    <ul className="ul-box">
                                        {
                                            pageData.length > 0 && pageData[0].imageList.map(function(v,i){
                                                return (
                                                    <li className="item-box" key={i}>
                                                        <ImageListItem url={v.contentUrl} frameWidth={winW*2} mask={true} />
                                                    </li>
                                                )
                                            })
                                        }
                                    </ul>
                                    <div className="case-detail-box">
                                        <div className="intro">
                                            <h2 ng-bind="casesDetail.data.schemeName">{pageData.length > 0 && pageData[0].schemeName}</h2>
                                            <p ng-bind="casesDetail.data.schemeDesc">
                                                {pageData.length > 0 && pageData[0].schemeDesc}
                                            </p>
                                        </div>
                                        <div className="person">
                                            <ul className="list-4-wxjs clearfix">
                                                <li className="item-box"><div className="box"><a className="avatar-box"><span>{pageData.length > 0 && pageData[0].schemeStyles[0].styleName}</span></a><div className="title"><h2><b>风格</b></h2></div></div></li>
                                                <li className="item-box" style={{display:'none'}}><div className="box"><a href={'#/scheme/style/' + (pageData.length > 0 && pageData[0].schemeStyles[0].styleId)} className="avatar-box"><b><i>更多相似</i><br/><i>风格欣赏</i></b></a></div></li>
                                            </ul>
                                        </div>
                                    </div>
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
