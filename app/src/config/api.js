var apiUrl = function(){
	var config = {
		scheme:'http://',
		host:location.hostname,
		port:location.port,
		endpoint:'api'
	};
	return config.scheme+ config.host + ':'
		+ config.port + '/' + config.endpoint + '/';
}

var Api = {
	httpGET:function(url,params){
		//var turl = apiUrl()+url+'?';
		//for(var i in params) turl += i + '=' + params[i] + '&';
		//console.log(turl.substring(0,turl.length-1));

		return $.get(apiUrl()+url,params);
	},
	httpPOST:function(url,params){
		return $.post(apiUrl()+url,$.param(params));
	}
}

module.exports = Api;
