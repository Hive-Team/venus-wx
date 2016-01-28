(function(win){
	var Api = require('./api.js');

	function r(rawData, result) {
		$.each(rawData, function(index,item) {
			if (item.type===true &&item.subModule[0] &&item.subModule[0].type === false) {
				result[item.moduleName] = {};
				r(item.subModule,result[item.moduleName]);
			}else if (item.subModule[0] && item.subModule[0].type === true && item.type===true){

				r(item.subModule,result);
			}else if (item.type == false){
				if (item.menuLink && item.menuLink[0] &&
						item.menuLink[0].menuLinkUrl !== '') {
							result[item.moduleName] = item.blockCode + '#' +
								item.menuLink[0].menuLinkUrl;
				}
			}

		});
	}


	function Core(){
		var self = this;
		this.isFeching = false;
		this.mode = (window.location.hostname.slice(0,2) === 'wx')?'online':'dev'; //开发模式
		this.resource =  {},
		this.menu = {

			'#/home':{
				'name':'全站首页',
			},
			'#/shot':{
				'name':'婚纱摄影',
				'sub':{
					'婚纱摄影首页':'#/shot',
					'样片欣赏':'#/samples',
					'客片欣赏':'#/pringles',
					'婚纱套系报价':'#/suite',
					'选摄影师':'#/photographers',
					'选造型师':'#/stylist',
					'婚纱纪实MV': '#/videos/1',
					'婚照技巧': '#/wenddingroom/1'
				}
			},
			'#/hotel':{
				'name':'婚宴预订',
				'sub':{
					'酒店预订':'#/hotel',
					'婚宴知识': '#/wenddingroom/2'
				}
			},
			'#/scheme':{
				'name':'婚礼定制',
				'sub':{
					'实景案例':'#/scheme',
					'策划师':'#/planners',
					'预订婚礼人':'#/f4',
					'婚礼跟拍': '#/scheme',
					'婚礼视频欣赏': '#/videos/3',
					'婚礼学堂': '#/wenddingroom/3'
				}
			},
			'#/dress': {
				'name': '婚纱礼服首页',
				'sub': {
					'婚纱礼服': '#/dress',
					'礼服知识': '#/wenddingroom/4'
				}
			},
			'#/movie': {
				'name': '微电影首页',
				'sub': {
					'微电影': '#/videos',
					'爱情MV': '#/videos/4',
					'爱情微电影': '#/videos5',
					'表演技巧': '#/wenddingroom/5'
				}
			},
			'#/appliance': {
				'name': '婚礼用品',
				'sub': {
					'婚礼用品': '#appliance'
				}
			},
			'#/rent': {
				'name': '婚车租赁',
				'sub': {
					'婚车租赁': '#rent'
				}
			}
		};

		this.getResourcesLinks = function(path,parent){
			var r = {};

			if (path === '/photographers' || path === '/stylists') {
				 r[path.slice(1)] = path.slice(1);
				return r;
			}
			//如果存在sub 就在sub里面找
			if (parent) {
				$.each(self.menu[parent]['sub'],function(k,v){
					if (v === '#'+path) {
						r = self.resource[k];
						return false;
					}
				})
			}else{
				r = self.resource[self.menu['#'+path]['name']];
				//console.log(r);
			}
			//否则

			return r;
		};
			this.User = {};
		this.promises = {
			'/': Api.httpGET('global/mainModule',{applicablePlatform:'wechat'})
			.done(function(payload){
				var parse = function(payload){
					var pretty = {};
					var menuData = null;

					//console.log(JSON.stringify(payload,null,4));
					// 找出pc的菜单根
					$.each(payload.data,function(k,v){
						if ($.trim(v.moduleName) === '微信') {
							menuData = v.subModule;
						}
					})

					menuData && r(menuData,pretty);
					!menuData && payload.data && r(payload.data,pretty);
					self.resource = pretty;

					//console.log(pretty);
				};
				(200 === payload.code) && parse(payload);
			})
		};
	}

	win.Core = new Core();
	win.sessionStorage.userHistory = "[]";
	//console.log(win.Core);

})(window);
