$(document).ready(function(){
    $('.sidenav').sidenav();
    $('.collapsible').collapsible();
    $('.modal').modal();
    $("#scrape-btn").on("click", function(e){
        window.location.href = "/index";
    })

    $(".clear-btn").on("click", function(e){
        window.location.href = "/delete";
    })




});
