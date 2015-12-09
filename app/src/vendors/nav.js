var nav_btn = $("#header .nav");
var arrow_up_down = $("#arrow_up_down");
var nav_parent = $("#nav_parent");
var arrow_down = $("#arrow_down");
var nav_fixed = $("#nav_fixed");
var isFixed = false;

nav_btn.bind("click",function(){
  if(!nav_btn.attr("isanim")){
    nav_btn.attr("isanim",1);
    arrow_down.css({display:"block"});
    arrow_up_down.removeClass("arrow-4-down-1-js").addClass("arrow-4-up-1-js");
    nav_parent.animate({
      height:90
    });
  }else{
    nav_btn.removeAttr("isanim");
    nav_parent.animate({
      height:0
    },function(){
      arrow_down.css({display:"none"});
      arrow_up_down.removeClass("arrow-4-up-1-js").addClass("arrow-4-down-1-js");
    });
  }
});

$(window).bind("mousewheel scroll",function(){
  if($(this).scrollTop() >= 200 && !isFixed){
    isFixed = true;
    nav_fixed.animate({
      top:0
    });
  }
  else if($(this).scrollTop() < 200 && isFixed){
    isFixed = false;
    nav_fixed.animate({
      top:-80
    });
  }
});


/*
   登录
    */
   var login_btn = $("#login_btn");
   var reg_btn = $("#reg_btn");
   var sign_drawer_box = $("#sign_drawer_box");
   var btn_off = $("#btn_off");
   var sign_bool = false;
   var sign_bool_1 = false;

   var btn_off_1 = $("#btn_off_1");
   var sign_drawer_box_1 = $("#sign_drawer_box_1");

   login_btn.bind("click",function(){
     if(!sign_bool){
       sign_drawer_box_1.animate({
         top:22
       },function(){sign_bool_1 = false});
       sign_drawer_box.animate({
         top:78
       },function(){sign_bool = true;});

     }else if(sign_bool){
       sign_drawer_box.animate({
         top:22
       },function(){sign_bool = false;});
     }
   });

   btn_off.bind("click",function(){
     if(sign_bool){
       sign_drawer_box.animate({
         top:22
       },function(){sign_bool = false;});
     }
   });

   //临时注册
   reg_btn.bind("click",function(){
     if(!sign_bool_1){
       sign_drawer_box.animate({
         top:22
       },function(){sign_bool = false;});
       sign_drawer_box_1.animate({
         top:78
       },function(){sign_bool_1 = true;});
     }else if(sign_bool_1){
       sign_drawer_box_1.animate({
         top:22
       },function(){sign_bool_1 = false;});
     }
   });

   btn_off_1.bind("click",function(){
     if(sign_bool_1){
       sign_drawer_box_1.animate({
         top:22
       },function(){sign_bool_1 = false;});
     }
   });
