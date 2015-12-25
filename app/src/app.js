var React  = require('react');
var Router = require('react-router-ie8');
var routes = require('./config/routes.js');

Router.run(routes,function(Root){
	React.render(<Root />,$('#JPage')[0])
})
