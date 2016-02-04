$.fn.Slider = function(obj){
    var setting = {
        device : 'pc',                           //pc,mobile
        time : 3000,                             //时间间隔
        changeClass : "item-current",            //当前
        sliderBoxClass : "slider-box",
        pointBoxClass : 'point-box',
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
        proportion : 1.5,                        //大图比例
        margin:0,
        focusShift:true,                         //
        displayBtn:false,                        //左右按钮是否现实
        type : "alpha",                          //默认alpha;Horizontal
    }

    if(obj){
        for(var i in obj){
            setting[i] = obj[i];
        }
    }

    var _self = $(this);
    var $sliderBox = $("." + setting.sliderBoxClass,_self);
    var $pointBox = $("." + setting.pointBoxClass,_self);
    var $points = $('.' +  setting.pointClass,_self);
    var $itemBox = $("." + setting.itemBoxClass,_self);
    var $items = $("." + setting.itemClass,_self);
    var $btnPrev = $("." + setting.btnPrevClass,_self);
    var $btnNext = $("." + setting.btnNextClass,_self);
    var $bigImgBox = $("." + setting.bigImgBox,_self);
    var $bigImg = $("." + setting.bigImgClass,_self);
    var clickBool = false;
    var lefBtn = '<div class="slider-btn-box slider-btn-lef"><i></i></div>';
    var rigBtn = '<div class="slider-btn-box slider-btn-rig"><i></i></div>';

    function slider(){
        if (setting.type == "alpha") {
            var imgIndex = 0;
            var $lefBtn = $(lefBtn);
            var $rigBtn = $(rigBtn);

            $($points[0]).addClass(setting.pointCurClass);
            $items.each(function (i) {
                $(this).css({position:"absolute",left:0,top:0});

                if (i == 0) {
                    $(this).addClass(setting.changeClass);
                }
            });

            var sliderInterval = sliderIntervalFunc();

            if($points.length > 1){
                $pointBox.css({display:'block'});
                setting.device === 'pc' && $points.each(function(i,e){
                    $(e).bind('mouseenter',function(){
                        imgIndex = $(this).index();

                        clearInterval(sliderInterval);
                        sliderPlay(imgIndex);
                    }).bind('mouseleave',function(){
                        sliderInterval = sliderIntervalFunc();
                    });
                });
            }

            $lefBtn.bind('click',function(e){
                e.preventDefault();

                if(imgIndex <= 0){
                    imgIndex = $points.length - 1;
                    clickMove(imgIndex);
                }else{
                    imgIndex -= 1;
                    clickMove(imgIndex);
                }
            })

            $rigBtn.bind('click',function(e){
                e.preventDefault();

                if(imgIndex >= $points.length - 1){
                    imgIndex = 0;
                    clickMove(imgIndex);
                }else{
                    imgIndex += 1;
                    clickMove(imgIndex);
                }
            })

            //加入左右按钮
            setting.displayBtn &&
            $points.length > 1 &&
            $sliderBox.append($lefBtn).append($rigBtn);

            function clickMove(i){
                clearInterval(sliderInterval);
                sliderPlay(i);
                sliderInterval = sliderIntervalFunc();
            }

            function sliderIntervalFunc(){
                return setInterval(function(){
                    imgIndex = imgIndex < $items.length - 1 ? imgIndex + 1 : 0;

                    sliderPlay(imgIndex);
                },setting.time);
            }

            function sliderPlay(i){
                $items.removeClass(setting.changeClass);
                $points.removeClass(setting.pointCurClass);
                $($items[i]).addClass(setting.changeClass);
                $($points[i]).addClass(setting.pointCurClass);
            }
        }
        else if(setting.type == "Horizontal"){
            var itemWidth = $items.width() + setting.margin;
            var imgIndex = 0;
            var $lefBtn = $(lefBtn);
            var $rigBtn = $(rigBtn);

            changeImg($($items[0]),imgIndex);

            $itemBox.width(function(){
                return $items.length * itemWidth - setting.margin;
            });
            $items.each(function(i){
                $(this).css({left:itemWidth * i })
            });

            var itemBoxWidth = $itemBox.width();
            var displayWidth = $sliderBox.width();

            $btnPrev.bind("click",function(){
                if(imgIndex > 0){
                    imgIndex --;

                    arrowFunc(imgIndex,itemWidth);
                }
            });

            $btnNext.bind("click",function(){
                if(imgIndex < $items.length - 1){
                    imgIndex ++;

                    arrowFunc(imgIndex,-itemWidth);
                }
            });

            $items.each(function(i){
                $(this).bind("click",function(){
                    imgIndex = i;

                    changeImg($(this),imgIndex);
                    return false;
                });
            });

            $lefBtn.bind('click',function(){
                if(imgIndex <= 0){
                    imgIndex = $points.length - 1;
                    clickMove(imgIndex);
                }else{
                    imgIndex -= 1;
                    clickMove(imgIndex);
                }
            })

            $rigBtn.bind('click',function(){
                if(imgIndex >= $points.length - 1){
                    imgIndex = 0;
                    clickMove(imgIndex);
                }else{
                    imgIndex += 1;
                    clickMove(imgIndex);
                }
            })

            //加入左右按钮
            setting.displayBtn &&
            $points.length > 1 &&
            $sliderBox.append($lefBtn).append($rigBtn);

            function arrowFunc(ind,iW){
                if($itemBox.length < 1)
                    if(setting.focusShift === true){
                        changeImg($($items[ind]),ind);
                        return;
                    }

                var left = $itemBox.position().left;
                setting.focusShift === true && changeImg($($items[imgIndex]),imgIndex);

                !clickBool &&
                ((iW > 0 && $itemBox.position().left < 0) ||
                (iW < 0 && $itemBox.position().left > displayWidth - itemBoxWidth)) &&
                itemBoxMove(left + iW);
            }

            function changeImg(dom,i){
                var index = i;

                dom.addClass(setting.changeClass);
                $items.each(function(i){
                    if(i != index)
                        $(this).removeClass(setting.changeClass);
                });

                $bigImg.css({opacity:0}).attr("src",$($items[index]).attr(setting.itemBigUrl));

                var imgWidth = dom.find('a').attr("data-width");
                var imgHeight = dom.find('a').attr("data-height");
                var imgBoxWidth = $bigImgBox.width();
                var imgBoxHeight = $bigImgBox.height();

                if(imgWidth/imgHeight >= setting.proportion){
                    imgHeight = imgBoxWidth * imgHeight / imgWidth;
                    $bigImg.width(imgBoxWidth).height(imgHeight);

                    imgWH((imgBoxHeight - imgHeight)/2,'auto');
                }else{
                    imgWidth = imgBoxHeight * imgWidth / imgHeight;
                    $bigImg.height(imgBoxHeight).width(imgWidth);

                    imgWH('auto',(imgBoxWidth - imgWidth)/2);
                    $bigImg.css({
                        marginLeft : (imgBoxWidth - imgWidth)/2,
                        marginTop : "auto",
                        display:'block'
                    });
                    imgLoad($bigImg[0],function(){
                        $bigImg.animate({opacity:1});
                    });
                }
            }

            function imgWH(t,l){
                $bigImg.css({
                    marginTop : t,
                    marginLeft : l,
                    display:'block'
                });
                imgLoad($bigImg[0],function(){
                    $bigImg.animate({opacity:1});
                });
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
