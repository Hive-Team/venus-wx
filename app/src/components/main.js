// 包含页头. 页尾
var React  = require('react');
var Router = require('react-router-ie8');
var RouteHandler = Router.RouteHandler;
//require('../config/core.js'); //单例
require('../vendors/slider.js');
var Main = React.createClass({
	componentWillMount : function(){
		window.historyStates = {
			isBack : false,
			counter : 0,
			states : []
		}
	},

	render:function(){
		return (
			<div className='ui-container'>
				<div className="screening-box-wx global-menu-wx">
					<ul className="screening-list-wx" id="global_menu_box">
						<li><a href='#/'>微信首页</a></li>
						<li><a href='#/samples'>婚纱摄影</a></li>
						<li><a href='#/hotel'>婚宴预订</a></li>
						<li><a href='#/cases'>婚庆定制</a></li>
						<li><a href='#/weddingdress'>婚纱礼服</a></li>
						<li><a href='#/video/movie_latest/0'>微电影</a></li>
						<li><a href='http://www.weihive.cn/weixin/index.php?&g=Wap&m=Product&a=index&token=ibhzwg1436836751'>婚戒钻石</a></li>
						<li><a href='#/weddingsupplies'>婚礼用品</a></li>
						<li><a href='#/weddingcarental'>婚车租赁</a></li>
					</ul>
					<div className="btn-box-wx" id="global_menu_btn">
						<span className="btn-wx">导航</span>
					</div>
				</div>
				<div className="screening-box-wx glob-back-detail" id="glob_detail_back">
					<div className="btn-box-wx">
						<span className="btn-wx">返回</span>
					</div>
				</div>
				<RouteHandler />
			</div>
		);
	},

	_clickBack : function(){
		var last;
		window.historyStates.isBack = true;
		window.historyStates.states.pop();
		last = window.historyStates.states.length - 1;
		console.log(window.historyStates.states);
		window.historyStates.states[last].isMenuRender = true;
		window.history.back();
	},

	componentDidMount:function(){
		var self = this;
		var $global_menu_box = $('#global_menu_box');
		var $global_menu_btn = $('#global_menu_btn');
		var $glob_back = $('#glob_back');
		var isGlobalMenu = false;

		$global_menu_btn.on('click',function(){
			if(!isGlobalMenu){
				isGlobalMenu = !isGlobalMenu;
				$global_menu_box.css({display:'block'});
			}else{
				isGlobalMenu = !isGlobalMenu;
				$global_menu_box.css({display:'none'})
			}
		});

		$global_menu_box.on('click','li',function(){
			isGlobalMenu = !isGlobalMenu;
			$global_menu_box.css({display:'none'});
		});

		$glob_back.on('click',function(){
			self._clickBack
		});
	}
})

module.exports = Main;
