var blog = {};

blog.tools = {};

//改变navbar样式的函数
blog.toggleNavCollapse = function(){
  /** 判断匹配元素，top的偏移量 */
  50 < $(".navbar").offset().top ? $(".navbar-fixed-top").addClass("top-nav-collapse") : $(".navbar-fixed-top").removeClass("top-nav-collapse");

  /** 控制目录的显示与隐藏 */
  if($(".main-left")){
    $(".navbar").offset().top>$(".header-title").height() ? $(".main-left").css("display","") : $(".main-left").css("display","none");
  }

  $(".navbar").offset().top>$(".header-title").height() ? $("#results-container").addClass("search-font-color") : $("#results-container").removeClass("search-font-color");

};
