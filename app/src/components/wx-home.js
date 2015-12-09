var React = require('react');
var PropTypes = React.PropTypes;
var ImageListItem = require('./image-item.js');
var Api = require('../config/api.js');
var Router = require('react-router-ie8');
var SKMap = require('../config/wx-skmap.js')
var WXHome = React.createClass({
    mixins:[Router.State], //我们需要知道当前的path params 等等信
    getInitialState: function() {
        return {
            tplKey:'top#adv',
            pageSize:10,
            pageIndex:1,
            payload:[],
            totalCount:0
        };
    },
    fetchData:function(url,params){
        return Api.httpGET(url,params);
    },
    componentDidMount: function() {
        // var $slider_box = $("#slider_box");
        // var $menu_box = $("#menu_box");
        // var $menu_home = $("#menu_home");
        // var winW = $(window).width();
        // var winH = $(window).height();
        // var bl = 800/1200;
        //
        // $slider_box.height(winW * bl).width(winW);
        // $menu_box.height(winH - $slider_box.height());
        // $menu_home.height($menu_box.height() - 130);

        var $slider_box = $("#slider_box");
        var $menu_box = $("#menu_box");
        var $home_title = $("#home_title");
        var $menu_home = $("#menu_home");
        var winW = $(window).width();
        var winH = $(window).height();
        var bl = 2/3;

        $slider_box.height(winW * bl).width(winW);
        $menu_box.height(winH - $slider_box.height());
        $menu_home.css({marginTop:$home_title.height(),height:$menu_box.height() - $home_title.height()})

        var self = this;

        var parseResource = function(){
          var pathArr = SKMap['#'+self.getPathname()].split('/');
          var resourceLinks = window.Core.resource;

          //console.log(pathArr);
          $.each(pathArr,function(k,v){
              resourceLinks = resourceLinks[v];
          });

          self.fetchData(resourceLinks.split('#')[1],
              {
                  pageSize:self.state.pageSize,
                  pageIndex:self.state.pageIndex
              })
              .done(function(payload){
                  (payload.data && payload.code === 200) &&
                  self.setState({
                      payload:((self.state.pageIndex === 1)?payload.data : self.state.payload.concat(payload.data)),
                      pageIndex:parseInt(self.state.pageIndex)+1,
                      baseUrl:resourceLinks.split('#')[1],
                      totalCount:parseInt(payload.totalCount)
                  });

                  $('#slider_home').Slider();
                  //console.log(JSON.stringify(payload.data,null,4))
              })
        }
        $.when(window.Core.promises['/'])
            .then(parseResource)

    },

    weixinAddContact : function(name) {
        WeixinJSBridge.invoke("addContact", {webtype: "1", username: name}, function (e) {
            WeixinJSBridge.log(e.err_msg);
            //e.err_msg:add_contact:added 已经添加
            //e.err_msg:add_contact:cancel 取消添加
            //e.err_msg:add_contact:ok 添加成功
            if (e.err_msg == 'add_contact:added' || e.err_msg == 'add_contact:ok') {
                //关注成功，或者已经关注过
            }
        })
    },

    render: function() {
        var width =$(window).width();
        var self = this;

        var topSliderData = this.state.payload.length>0 && this.state.payload || [];
        //console.log(topSliderData);
        return (
            <div className="home-box">
                <div className="home-banner responsive-box" id="slider_box">
                  <div id="slider_home" className="slider-box-1-js responsive-box">
                    <ul className="slider">
                          {
                              $.map(
                                  topSliderData || []
                                  ,function(v,i){
                                      return (
                                          <li className="item transition-opacity-1" key={i}>
                                              <ImageListItem
                                                  sid={v.contentId}
                                                  frameWidth={1200}
                                                  url={v.contentUrl}
                                                  detailUrl={v.detailUrl}
                                                  errorUrl={'http://placehold.it/375x250'}
                                                  />
                                          </li>
                                      )
                                  })
                          }
                    </ul>
                  </div>
                </div>
                <section className="menu-box" id="menu_box">
                  <div className="home-title" id='home_title'/>
                    <ul className="menu-home" id="menu_home">
                        <li className="item"><a href="#/samples"><span className="font-bg-1-wxjs font-bg-1-1-wxjs" /></a></li>
                        <li className="item"><a href="#/hotel"><span className="font-bg-1-wxjs font-bg-1-2-wxjs" /></a></li>
                        <li className="item"><a href='#/scheme'><span className="font-bg-1-wxjs font-bg-1-3-wxjs" /></a></li>
                        <li className="item"><a href='#/weddingdress'><span className="font-bg-1-wxjs font-bg-1-4-wxjs" /></a></li>
                        <li className="item"><a href='http://www.weihive.cn/weixin/index.php?&g=Wap&m=Product&a=index&token=ibhzwg1436836751'><span className="font-bg-1-wxjs font-bg-1-5-wxjs" /></a></li>
                        <li className="item"><a href='#/videos/0'><span className="font-bg-1-wxjs font-bg-1-6-wxjs" /></a></li>
                        <li className="item"><a href='#/weddingsupplies'><span className="font-bg-1-wxjs font-bg-1-7-wxjs" /></a></li>
                        <li className="item"><a href='#/weddingcarental'><span className="font-bg-1-wxjs font-bg-1-8-wxjs" /></a></li>
                    </ul>
                </section>
            </div>
        );
    }
});

module.exports = WXHome;
