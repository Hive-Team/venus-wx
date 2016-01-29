var React = require('react');
var Router = require('react-router-ie8');

var HeaderMenu = React.createClass({
    mixins:[Router.State],

    getInitialState : function(){
        return {
            menu : {
                'menu_1' : [
                    {
                        name : '作品欣赏',
                        href : '#/samples'
                    },
                    {
                        name : '客片欣赏',
                        href : '#/pringles'
                    },
                    {
                        name : '套系报价',
                        href : '#/suite'
                    },
                    {
                        name : '旅拍',
                        href : 'http://mtrip.jsbn.com'
                    },
                    //{
                    //    name : '选摄影团队',
                    //    href : '#/phototeam'
                    //},
                    //{
                    //    name : '造型师',
                    //    href : '#/stylist'
                    //},
                    {
                        'name': '婚纱纪实',
                        'href': '#/videos/1'
                    },
                    {
                        'name': '婚照技巧',
                        'href': '#/wenddingroom/1'
                    }
                ],
                'menu_2' : [
                    {
                        name : '婚宴预订',
                        href : '#/hotel'
                    },
                    {
                        name : '婚宴知识',
                        href : '#/wenddingroom/2'
                    }
                ],
                'menu_3' : [
                    {
                        name : '实景案例',
                        href : '#/scheme'
                    },
                    {
                        name : '婚礼跟拍',
                        href : '#/weddingpat'
                    },
                    {
                        name : '婚礼视频',
                        href : '#/videos/3'
                    },
                    //{
                    //    name : '选策划师',
                    //    href : '#/planners'
                    //},
                    {
                        name : '选婚礼人',
                        href : '#/f4'
                    },
                    {
                        name : '婚礼学堂',
                        href : '#/wenddingroom/3'
                    }
                ],
                'menu_4' : [
                    {
                        name : '婚纱礼服',
                        href : '#/weddingdress'
                    },
                    {
                        name : '礼服知识',
                        href : '#/wenddingroom/4'
                    }
                ],
                'menu_5' : [
                    {
                        name : '微电影',
                        href : '#/videos/0'
                    },
                    {
                        name : '爱情MV',
                        href : '#/videos/4'
                    },
                    {
                        name : '爱情微电影',
                        href : '#/videos/5'
                    },
                    {
                        name : '表演技巧',
                        href : '#/wenddingroom/5'
                    }
                ],
                'menu_6' : [],
                'menu_7' : [
                    {
                        name : '婚礼用品',
                        href : '#/weddingsupplies'
                    },
                    {
                        name : '用品贴士',
                        href : '#/wenddingroom/7'
                    }
                ],
                'menu_8' : [
                    {
                        name : '婚车租赁',
                        href : '#/weddingcarental'
                    },
                    {
                        name : '租车经验',
                        href : '#/wenddingroom/8'
                    }
                ]
            }
        }
    },

    componentDidMount: function() {
        var header_menu_b = false;
        var contact_us_btn = false;
        var $btn_menu = $('#btn_menu');
        var $contact_us = $('#contact_us');
        var $menu_box = $('#menu_box');
        var $menu_box_1 = $('#menu_box_1');
        var $arrow = $('.arrow-3-wxjs',$btn_menu);
        var lt_h = 51*this.state.menu[this.props.menuType].length || '';
        var lt_h_1 = 402;

        $btn_menu.bind('click',function(){
            if(header_menu_b){
                header_menu_b = !header_menu_b;
                $menu_box.animate({height:0});
                $arrow.removeClass('arrow-3-1-down-wxjs').addClass('arrow-3-1-lef-wxjs');
            }else{
                header_menu_b = !header_menu_b;
                contact_us_btn = false;
                $menu_box.animate({height:lt_h});
                $menu_box_1.animate({height:0});
                $arrow.removeClass('arrow-3-1-lef-wxjs').addClass('arrow-3-1-down-wxjs');
            }
        });

        $contact_us.bind('click',function(){
            if(contact_us_btn){
                contact_us_btn = !contact_us_btn;
                $menu_box_1.animate({height:0});
            }else{
                header_menu_b = false;
                contact_us_btn = !contact_us_btn;
                $menu_box.animate({height:0});
                $menu_box_1.animate({height:lt_h_1});
                $arrow.removeClass('arrow-3-1-down-wxjs').addClass('arrow-3-1-lef-wxjs');
            }
        });

        $menu_box.on('click','li',function(){
            header_menu_b = !header_menu_b;
            $menu_box.animate({height:0});
            $arrow.removeClass('arrow-3-1-down-wxjs').addClass('arrow-3-1-lef-wxjs');
        });

        $menu_box_1.on('click','li',function(){
            contact_us_btn = !contact_us_btn;
            $menu_box_1.animate({height:0});
        });
    },

    render: function() {
        var self = this;
        var current_menu = self.state.menu[self.props.menuType];

        return (
            <div className="header-view navbar navbar-app navbar-absolute-top">
                <div className="pos-box">
                    <div className="btn-rig" style={{display:'none'}}><i className="phone"><em></em></i><span>400-015-9999</span></div>
                    <div className="btn-rig" id='contact_us'><b>联系我们</b></div>
                    <div className="navbar-brand navbar-brand-center" id="btn_menu">
                        <span>{current_menu[self.props.name].name}</span><i className="arrow-3-wxjs arrow-3-1-lef-wxjs"></i>
                    </div>
                    <ul className="head-menu-box clearfix" id="menu_box">
                        {
                            $.map(current_menu || [],function(v,i){
                                return(
                                    <li key={i}><a href={v.href}>{v.name}</a></li>
                                )
                            })
                        }
                    </ul>
                    <ul className="head-menu-box clearfix" id='menu_box_1'>
                        <li><a href="tel:400-015-9999">Tel：400-015-9999</a></li>
                        <li><a href="http://chat16.live800.com/live800/chatClient/chatbox.jsp?companyID=533854&configID=75804&jid=6937519900&skillId=4927">在线咨询</a></li>
                        <li className='qr_codes'><a><img src='./assets/images/qr_codes.jpg' /></a></li>
                    </ul>
                </div>
            </div>
        );
    }

});

module.exports = HeaderMenu;
