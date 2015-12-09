var $win = $(window);
var slider = $("#slider_home");
var home_nav_fixed = $("#home_nav_fixed");
var isFixed = false;
var date1 = new Date().getTime();
var date2;
var homeModuleRequest = {
    pageIndex: 1,
    pageSize: 10
}

// $("#nav_main,#nav_fixed,#header,#footer").css({display:"none"});

$win.bind("mousewheel scroll", function() {
    date2 = new Date().getTime();

    if (/safari/.test(navigator.userAgent.toLowerCase())) {
        if ((date2 - date1) > 10) {
            scroll($(this));
            date1 = date2;
        }
    } else {
        scroll($(this));
    }

    if ($(this).scrollTop() >= 720 && !isFixed) {
        isFixed = true;
        home_nav_fixed.animate({
            top: 0
        });
    } else if ($(this).scrollTop() < 720 && isFixed) {
        isFixed = false;
        home_nav_fixed.animate({
            top: -80
        });
    }
});

function scroll(t) {
    var slider = $("#slider_home");
    var scrollTop = t.scrollTop();
    if (scrollTop < 0) {
        slider.css({
            top: 0 - scrollTop
        });
    } else if (scrollTop < 680  && scrollTop >= 0) {
        slider.css({
            top: -scrollTop*0.86
        });
    } else {
        slider.css({
            top: scrollTop
        });
    }
}
