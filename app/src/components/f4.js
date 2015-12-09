var React = require('react');
var F4 = React.createClass({
	componentDidMount:function(){
		$('#slider_top').Slider();

		//以父级作为更新
		$.when(window.Core.promises['/']).then(function(){
		 	$(document.body).trigger('ModuleChanged',['#/scheme']);
		});
	},
	render:function(){
		return (
			<div className="main responsive-box clearfix">
				<div className="custom-banner responsive-box mgb30">
				  <div id="slider_top" className="slider-box-1-js responsive-box">
				    <ul className="slider">
						<li className="item transition-opacity-1"
						ng-repeat='a in samplesList.top track by a.contentId' ng-init='samplesList.func($last)'>
							<a className="img-box"><img src='http://placehold.it/1200x680' /></a>
						</li>
				    </ul>
				  </div>
				</div>
			  <div className="sel-card-1-js clearfix">
				<span className="card">金色百年主持人团队</span>
				<span className="card">金色百年化妆师团队</span>
				<span className="card">金色百年摄影师团队</span>
				<span className="card card-sel">金色百年摄像师团队</span>
				<div className="line-bottom"></div>
			  </div>
			  <div className="sel-card-2-js clearfix">
				<span className="title"><i className="ico-1-js ico-1-1-js">¥</i>价位</span><span className="card card-sel">全部</span>
				<div className="card-box column-mg20-20">
				  <span className="card">500</span><span className="card">800</span><span className="card">1200</span><span className="card">1500</span><span className="card">2000</span><span className="card">3000</span>
				</div>
			  </div>
			  <div className="screening-results clearfix"><span className="title">你选择了：</span>
				<div className="column-mg20-20"><span className="seled">李晓雯<i className="delete-1-js">x</i></span><span className="wait-pay">等待支付</span></div>
				<span className="number">找到<b>30</b>个</span>
			  </div>
			  <ul className="list-3-js">
				<li>
				  <a className="figure">
					<div className="avatar-box"><img src="/assets/$0" /><span>关注（222123）</span></div>
					<h2 className="transition-color">摄影师<b className="transition-color">杜玥菲</b><span>￥800.00</span></h2>
					<p>对婚礼策划有着近乎疯狂的喜爱，把所有新人的爱与美在婚礼当天展示给所有人，是我最美好的愿望。我是位普通婚礼人，但有我你就不用担心你的婚礼啦！</p>
					<div className="score">
					  <span>新人评价</span><i></i>
					</div>
					<span className="btn-js btn-grayline-pink-1-js transition-bg">选择他</span>
				  </a>
				  <ul className="list-4-js list-4-1-js">
					<li className="column-6 mgr20">
					  <div className="hover-box">
						<div className="pos-box">
						  <div className="info transition-bottom">
							<h2 className="transition-font-size">缘来你在此</h2>
							<p>
							  时间：<span>2014-8-30</span><br/>
							  地点：<span>重庆华彬庄园</span><br/>
							  成本：<span>￥35000.00</span>
							</p>
							<span className="btn-js btn-blue-1-js transition-bg">点击观看</span>
						  </div>
						  <div className="mask-bg transition-opacity"></div>
						</div>
					  </div>
					  <img src="http://placehold.it/300x220"/>
					</li>
					<li className="column-6 mgr20">
					  <div className="hover-box">
						<div className="pos-box">
						  <div className="info transition-bottom">
							<h2 className="transition-font-size">缘来你在此</h2>
							<p>
							  时间：<span>2014-8-30</span><br/>
						  	  地点：<span>重庆华彬庄园</span><br/>
							  成本：<span>￥35000.00</span>
							</p>
							<span className="btn-js btn-blue-1-js transition-bg">点击观看</span>
						  </div>
						  <div className="mask-bg transition-opacity"></div>
						</div>
					  </div>
					  <img src="http://placehold.it/300x220"/>
					</li>
				  </ul>
				</li>
				<li>
				  <a className="figure">
					<div className="avatar-box"><img src="/assets/images/test/avatar.png"/><span>关注（222123）</span></div>
					<h2 className="transition-color">摄影师<b className="transition-color">杜玥菲</b><span>￥800.00</span></h2>
					<p>对婚礼策划有着近乎疯狂的喜爱，把所有新人的爱与美在婚礼当天展示给所有人，是我最美好的愿望。我是位普通婚礼人，但有我你就不用担心你的婚礼啦！</p>
					<div className="score">
					  <span>新人评价</span><i></i>
					</div>
					<span className="btn-js btn-grayline-pink-1-js transition-bg">选择他</span>
				  </a>
				  <ul className="list-4-js list-4-1-js">
					<li className="column-6 mgr20">
					  <div className="hover-box">
						<div className="pos-box">
						  <div className="info transition-bottom">
							<h2 className="transition-font-size">缘来你在此</h2>
							<p>
							  时间：<span>2014-8-30</span><br/>
						  地点：<span>重庆华彬庄园</span><br/>
							  成本：<span>￥35000.00</span>
							</p>
							<span className="btn-js btn-blue-1-js transition-bg">点击观看</span>
						  </div>
						  <div className="mask-bg transition-opacity"></div>
						</div>
					  </div>
					  <img src="http://placehold.it/300x220"/>
					</li>
					<li className="column-6 mgr20">
					  <div className="hover-box">
						<div className="pos-box">
						  <div className="info transition-bottom">
							<h2 className="transition-font-size">缘来你在此</h2>
							<p>
							  时间：<span>2014-8-30</span><br/>
						  地点：<span>重庆华彬庄园</span><br/>
							  成本：<span>￥35000.00</span>
							</p>
							<span className="btn-js btn-blue-1-js transition-bg">点击观看</span>
						  </div>
						  <div className="mask-bg transition-opacity"></div>
						</div>
					  </div>
					  <img src="http://placehold.it/300x220"/>
					</li>
				  </ul>
				</li>
			  </ul>
			</div>



		);
	}
})

module.exports = F4;
