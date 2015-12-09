//
$.fn.Slider = function(obj,func){
    var setting = {
        time : 3000,                                //时间间隔
        changeClass : "item-current",           //当前
        sliderBoxClass : "slider-box",
        pointClass : 'point',
        pointCurClass : 'point-current',
        itemBoxClass : "item-box",
        itemClass : "item",
        itemBigUrl : "data-big-img-url",
        imgBox : "img-box",
        btnPrevClass : "btn-prev",
        btnNextClass : "btn-next",
        bigImgBox : "kpxq-img-box",
        bigImgClass : "big-img",
        bigImgUrls : null,
        proportion : 1.5,
        margin:0,
        type : "alpha"                       //默认alpha;Horizontal
    }

    if(obj){
        for(var i in obj){
            setting[i] = obj[i];
        }
    }

    var _self = $(this);
    var $sliderBox = $("." + setting.sliderBoxClass,_self);
    var $points = $('.' +  setting.pointClass,_self);
    var $itemBox = $("." + setting.itemBoxClass,_self);
    var $items = $("." + setting.itemClass,_self);
    var $btnPrev = $("." + setting.btnPrevClass,_self);
    var $btnNext = $("." + setting.btnNextClass,_self);
    var $bigImgBox = $("." + setting.bigImgBox,_self);
    var $bigImg = $("." + setting.bigImgClass,_self);
    var clickBool = false;

    function slider(){
        if (setting.type == "alpha") {
            $($points[0]).addClass(setting.pointCurClass);
            $items.each(function (i) {
                $(this).css({position: "absolute", left: 0, top: 0});

                if (i == 0) {
                    $(this).addClass(setting.changeClass);
                }
            });

            setInterval(function(){
                $items.each(function(i){
                    if($(this).hasClass(setting.changeClass)){
                        imgIndex = i;
                    }
                });

                $($items[imgIndex]).removeClass(setting.changeClass);
                $($points[imgIndex]).removeClass(setting.pointCurClass);

                if(imgIndex < $items.length - 1){
                    $($items[imgIndex + 1]).addClass(setting.changeClass);
                    $($points[imgIndex + 1]).addClass(setting.pointCurClass);
                }else{
                    $($items[0]).addClass(setting.changeClass);
                    $($points[0]).addClass(setting.pointCurClass);
                }

            },setting.time);
        }
        else if(setting.type == "Horizontal"){
            var itemWidth = $items.width();
            var imgIndex = 0;

            changeImg($($items[0]),imgIndex);

            $itemBox.width(function(){
                return $items.length * itemWidth + ($items.length - 1) * setting.margin
            });
            $items.each(function(i){
                $(this).css({left:itemWidth * i})
            });

            var itemBoxWidth = $itemBox.width();
            var displayWidth = $sliderBox.width();

            $btnPrev.bind("click",function(){
                if(imgIndex > 0 && imgIndex <= $items.length - 1){
                    imgIndex --;

                    changeImg($($items[imgIndex]),imgIndex);

                    var left = $itemBox.position().left;

                    if(!clickBool && $itemBox.position().left < 0){
                        itemBoxMove(left + itemWidth);
                    }
                }
            });

            $btnNext.bind("click",function(){
                if(imgIndex >= 0 && imgIndex < $items.length - 1){
                    imgIndex ++;

                    changeImg($($items[imgIndex]),imgIndex);

                    var left = $itemBox.position().left;

                    if(!clickBool && $itemBox.position().left > displayWidth - itemBoxWidth){
                        itemBoxMove(left - itemWidth);
                    }
                }
            });

            $items.each(function(i){
                $(this).bind("click",function(){
                    imgIndex = i;

                    changeImg($(this),imgIndex);
                    return false;
                });
            });

            function changeImg(dom,i){
                var index = i;

                dom.addClass(setting.changeClass);
                $items.each(function(i){
                    if(i != index)
                        $(this).removeClass(setting.changeClass);
                });

                $bigImg.css({opacity:0}).attr("src",$($items[index]).attr(setting.itemBigUrl));

                var width = $("." + setting.imgBox,dom).attr("data-width");
                var height = $("." + setting.imgBox,dom).attr("data-height");

                if(width/height >= setting.proportion){
                    $bigImg.width("100%").height($bigImgBox.width()*height/width);
                    $bigImg.css({
                        marginTop : ($bigImgBox.height() - $bigImg.height())/2,
                        marginLeft : "auto"
                    });
                    imgLoad($bigImg[0],function(){
                        $bigImg.animate({opacity:1});
                    });
                }else{
                    $bigImg.height("100%").width($bigImgBox.height()*width/height);
                    $bigImg.css({
                        marginLeft : ($bigImgBox.width() - $bigImg.width())/2,
                        marginTop : "auto"
                    });
                    imgLoad($bigImg[0],function(){
                        $bigImg.animate({opacity:1});
                    });
                }
            }

            function itemBoxMove(n){
                clickBool = true;
                $itemBox.animate({
                    left : n
                },function(){clickBool = false;});
            }
        }

        function imgLoad(img,callback){
            if(img){
                img.complete || /*img.readyState == "loaded" ||*/ img.readyState == "complete" ? callback() : img.onload = callback;
            }
        }
    }

    slider();
}
