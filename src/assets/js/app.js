// For scroll down
$(".icondown").click(function() {
  $('html, body').animate({
    scrollTop: $("#ventures").offset().top - 0
  }, 1200);
});


// for slider slides number
  var totalItems = $('.carousel-item').length;
  var currentIndex = $('div.active').index() + 1;
  $('.num .current').html(currentIndex);
  $('.num .total').html(totalItems);

  $('#mainslider').carousel({
    interval: 5000
  });

  $('#mainslider').bind('slid.bs.carousel', function() {
    currentIndex = $('div.active').index() + 1;
    $('.num .current').html(currentIndex);
    $('.num .total').html(totalItems);

  });
//search bar header
$(".searchicon").click(function() {
$(".searholder").removeClass('newactive');
    $(".searholder").addClass('active');

});

$(".closeicon").click(function() {
  $(".searholder").addClass('newactive');
  setTimeout(function(){
    $(".searholder").removeClass('active');
 }, 1200);
});
