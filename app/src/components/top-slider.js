var React = require('react');
var Api = require('../config/api.js');
var ImageListItem = require('./image-item.js');
var TopSlider = React.createClass({
	getInitialState:function(){
		return  {
			payload:[],
			baseUrl:''
		};
	},

	componentWillReceiveProps:function(nextProps){
		var self = this;
		var dataPromise = function(url,params){
			console.log('dataPromise',url);
			return Api.httpGET(url,params);
		}
		nextProps.resourceLinks && (self.props.resourceLinks !== nextProps.resourceLinks)&&
		$.each(nextProps.resourceLinks,function(k,v){
			(nextProps.tplKey.indexOf(v.split('/')[0]) > -1)&&
			dataPromise(v.split('#')[1],{pageSize:nextProps.pageSize,pageIndex:nextProps.pageIndex})
				.done(
					function(payload){
						console.log(JSON.stringify(payload,null,4));
						200 === payload.code && payload.data && self.setState({
							payload:payload.data.concat(self.state.payload),
							baseUrl:v.split('#')[1]
						},function(){
							$('#slider_top').length>0 && $('#slider_top').Slider();
							$('#slider_home').length>0 && $('#slider_home').Slider();
							$('#slider_mid').length>0 && $('#slider_mid').Slider();
						})
					}
				)
		})
	},

	componentDidUpdate:function(){

	},
	render:function(){
		var baseUrl = this.state.baseUrl;
		var items=this.state.payload || [];

		//console.log(items)
		if (items.lenghth === 0) {
			items=[{}]
		}
		return (
			<ul className="slider">
				{
					items.map(function(v,i){
						return (
							<li className="item transition-opacity-1" key={i}>
								<ImageListItem
									sid={v.contentId}
									frameWidth={1200}
									frameHeight={800}
									url={v.contentUrl || v.weddingCaseImage}
									detailUrl={v.detailUrl}
									errorUrl={'http://placehold.it/1200x680'}

									/>
							</li>
						)
					})
				}
			</ul>
		)
	}
})
module.exports = TopSlider;
