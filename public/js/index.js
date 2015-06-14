var socket = io();
$(function () {
    var x = 0,
        y = 0,
        delta = [0, -1],
        width = 100,
        height = 100;
    var origin = {
        left: $(document).width()/2-100,
        top: $(document).height()/2-75
    };
    var img;
    function placeTile(elt){

    }
    $(window).load(function(){
        if (images.length){
            for (var i = 0; i<Math.pow(Math.max(width, height),2); i++) {
                img = $('#imageWall .image').eq(i);
                if ((-width/2 < x <= width/2)
                    && (-height/2 < y <= height/2)) {
                    if(img.length){

                        img.css({
                            left:origin.left + x*200 +'px',
                            top:origin.top + y*150+'px'
                        }).delay(100*i).queue(function(){
                            $(this).addClass('animate')
                        })
                    }else{
                        break;
                    }
                }

                if (x === y
                    || (x < 0 && x === -y)
                    || (x > 0 && x === 1-y)){
                    // change direction
                    delta = [-delta[1], delta[0]]
                }

                x += delta[0];
                y += delta[1];
            }
        }
    });

    socket.on("imageAdded", function (data, buffer) {

        if (data.image) {

            if ($('#imageWall .image[data-client="' + data.client + '"]').length == 0) {
                $('#imageWall').append('<div class="image" data-client="' + data.client + '"><img src=' + data.image +'><p></p></div> ')
                $('#imageWall .image[data-client="' + data.client + '"] img').load(function () {

                    if ((-width/2 < x <= width/2)
                        && (-height/2 < y <= height/2)) {
                        $(this).parent().css({
                            left:origin.left + x*200 +'px',
                            top:origin.top + y*150+'px'
                        });
                        $(this).parent().addClass('animate');
                        $(this).unbind('load');
                    }

                    if (x === y
                        || (x < 0 && x === -y)
                        || (x > 0 && x === 1-y)){
                        // change direction
                        delta = [-delta[1], delta[0]]
                    }

                    x += delta[0];
                    y += delta[1];
                })
            } else {
                $('#imageWall .image[data-client="' + data.client + '"]').removeClass('animate')
                setTimeout(function () {
                    $('#imageWall .image[data-client="' + data.client + '"] img').attr('src', data.image)
                    $('#imageWall .image[data-client="' + data.client + '"]').addClass('animate')
                }, 150);

            }
        }
    });
    socket.on('imageFiltered', function (data) {
        $('#imageWall .image[data-client="' + data.client + '"]').removeClass('animate')
        setTimeout(function () {

            $('#imageWall .image[data-client="' + data.client + '"] img').attr('src', data.image + '?i=' + Date.now())
            $('#imageWall .image[data-client="' + data.client + '"]').addClass('animate');
        }, 150);

    });
    socket.on('messageSent',function(data){
        $('#imageWall .image[data-client="' + data.client + '"] p').html(data.message)
    });
});