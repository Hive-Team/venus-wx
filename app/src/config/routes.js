var React  = require('react');
var Main = require('../components/main.js'); //根页面
var Home = require('../components/wx-home.js'); //首页列表
var Router = require('react-router-ie8');
var DefaultRoute = Router.DefaultRoute;
var Route = Router.Route;
var Samples = require('../components/wx-samples-list.js');
var SamplesDetail = require('../components/wx-samples-detail.js');
var Pringles = require('../components/wx-pringles-list.js');
var PringlesDetail = require('../components/wx-pringles-detail.js');
var Suites = require('../components/wx-suites.js');
var SuiteDetail = require('../components/wx-suite.js');
//var PhotoTeam = require('../components/wx-photographer-list.js');
//var Stylist = require('../components/wx-stylist-list.js');
//var PhotoTeamDetail = require('../components/wx-photographer-stylist-detail.js');
//var PhotoTeamProduct = require('../components/wx-photographer-stylist-product.js');
var Hotel = require('../components/wx-hotel.js');
var HotelDetail = require('../components/wx-hotel-detail.js');
var Scheme = require('../components/wx-scheme.js');
var SchemeDetail = require('../components/wx-scheme-detail.js');
//var Planners = require('../components/wx-planners.js');
//var PlannerDetail = require('../components/wx-planner-detail.js');
//var PlannerProduct = require('../components/wx-planner-product.js');
var F4 = require('../components/wx-f4.js');
var DresserPhotographerDetail = require('../components/wx-dress-photographer-detail.js');
var VideoPlayerDetail = require('../components/wx-video-player.js');
var WeddingDress = require('../components/wx-wedding-dress.js');
var WeddingDressDetail = require('../components/wx-wedding-dress-detail.js');
var WeddingMV = require('../components/wx-wedding-video.js');
var WeddingVideoDetail = require('../components/wx-video2-player.js');
var WeddingVideo = require('../components/wx-wedding-video.js');
var WeddingMovie = require('../components/wx-wedding-movie.js');
var WeddingLoveMV = require('../components/wx-wedding-lovemv.js');
var WeddingLoveMovie = require('../components/wx-wedding-lovemovie.js');
var WeddingClass = require('../components/wx-wedding-class.js');
var WeddingClassDetail = require('../components/wx-wedding-class-detail.js');
var WeddingPat = require('../components/wx-weddingpat.js');
var WeddingSupplies = require('../components/wx-wedding-supplies.js');
var WeddingCarRental = require('../components/wx-wedding-carental.js');
var WeddingCarRentalDetail = require('../components/wx-wedding-carental-detail.js');

var routes = (
	<Route handler={Main} path='/' name='app'>
		<Route name='home' path='home' handler={Home} />
		<Route name='samples' path='samples' handler={Samples} />
		<Route name='samples-detail' path='samples/:moduleId/:contentId' handler={SamplesDetail} />
		<Route name='pringles' path='pringles' handler={Pringles} />
		<Route name='pringles-detail' path='pringles/:moduleId/:contentId' handler={PringlesDetail} />
		<Route name='suite' path='suite' handler={Suites} />
		<Route name='suite-detail' path='suite/:moduleId/:productId' handler={SuiteDetail} />
		{
			//<Route name='phototeam' path='phototeam' handler={PhotoTeam} />
			//<Route name='phototeam-detail' path='team/:levelId/:ind' handler={PhotoTeamDetail} />
			//<Route name='phototeam-product' path='team/:teamId/works/:contentId' handler={PhotoTeamProduct} />
		}
		<Route name='wedding-mv' path='videos/1' handler={WeddingMV} />
		<Route name='wedding-mv-detail' path='videos/1/:videoId' handler={WeddingVideoDetail} />
		<Route name='hotel' path='hotel' handler={Hotel} />
		<Route name='hotel-detail' path='hotel/:moduleId/:hotelId' handler={HotelDetail} />
		<Route name='scheme' path='scheme' handler={Scheme} />
		<Route name='scheme-style' path='scheme/style/:styleId' handler={Scheme} />
    	<Route name='scheme-detail' path='scheme/:moduleId/:contentId' handler={SchemeDetail} />
		{
			//<Route name='planners' path='planners' handler={Planners} />
			//<Route name='planner-product' path='planner/:plannerId/:num' handler={PlannerProduct} />
			//<Route name='planner-detail' path='planner/:plannerId/works' handler={PlannerDetail} />
		}
    	<Route name='F4' path='f4' handler={F4} />
    	<Route name='host-detal' path='f4/host/:personId' handler={VideoPlayerDetail} />
    	<Route name='dresser-detail' path='f4/dresser/:personId' handler={DresserPhotographerDetail} />
    	<Route name='f4-photographer-detail' path='f4/photographer/:personId' handler={DresserPhotographerDetail} />
    	<Route name='cameraman-detail' path='f4/camera/:personId' handler={VideoPlayerDetail} />
    	<Route name='wedding-dress' path='weddingdress' handler={WeddingDress} />
    	<Route name='wedding-dress-detail' path='dress/brand/:brandId' handler={WeddingDressDetail} />
		<Route name='wedding-video' path='videos/3' handler={WeddingVideo} />
		<Route name='wedding-video-detail' path='videos/3/:videoId' handler={WeddingVideoDetail} />
		<Route name='wedding-movie' path='videos/0' handler={WeddingMovie} />
		<Route name='wedding-movie-detail' path='videos/0/:videoId' handler={WeddingVideoDetail} />
		<Route name='wedding-lovemv' path='videos/4' handler={WeddingLoveMV} />
		<Route name='wedding-lovemv-detail' path='videos/4/:videoId' handler={WeddingVideoDetail} />
		<Route name='wedding-lovemovie' path='videos/5' handler={WeddingLoveMovie} />
		<Route name='wedding-lovemovie-detail' path='videos/5/:videoId' handler={WeddingVideoDetail} />
		<Route name='wedding-class1' path='wenddingroom/1' handler={WeddingClass} />
		<Route name='wedding-class1-detail' path='wenddingroom/1/:weddingClassroomId' handler={WeddingClassDetail} />
		<Route name='wedding-class2' path='wenddingroom/2' handler={WeddingClass} />
		<Route name='wedding-class2-detail' path='wenddingroom/2/:weddingClassroomId' handler={WeddingClassDetail} />
		<Route name='wedding-class3' path='wenddingroom/3' handler={WeddingClass} />
		<Route name='wedding-class3-detail' path='wenddingroom/3/:weddingClassroomId' handler={WeddingClassDetail} />
		<Route name='wedding-class4' path='wenddingroom/4' handler={WeddingClass} />
		<Route name='wedding-class4-detail' path='wenddingroom/4/:weddingClassroomId' handler={WeddingClassDetail} />
		<Route name='wedding-class5' path='wenddingroom/5' handler={WeddingClass} />
		<Route name='wedding-class5-detail' path='wenddingroom/5/:weddingClassroomId' handler={WeddingClassDetail} />
		<Route name='wedding-class7' path='wenddingroom/7' handler={WeddingClass} />
		<Route name='wedding-class7-detail' path='wenddingroom/7/:weddingClassroomId' handler={WeddingClassDetail} />
		<Route name='wedding-class8' path='wenddingroom/8' handler={WeddingClass} />
		<Route name='wedding-class8-detail' path='wenddingroom/8/:weddingClassroomId' handler={WeddingClassDetail} />
		<Route name='wedding-pat' path='weddingpat' handler={WeddingPat} />
		<Route name='wedding-supplies' path='weddingsupplies' handler={WeddingSupplies} />
		<Route name='wedding-supplies-detail' path='supplies/:suppliesid/:detailId' handler={WeddingCarRentalDetail} />
		<Route name='wedding-carental' path='weddingcarental' handler={WeddingCarRental} />
		<Route name='wedding-carental-detail' path='car/:carID/:weddingCarRentalId' handler={WeddingCarRentalDetail} />
		<DefaultRoute handler={Home} />
	</Route>
);

module.exports = routes;
