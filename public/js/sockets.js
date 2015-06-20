var socket = io();
socket.on("imageAdded", function (data, buffer) {

    if (data.image) {

        if ($('#imageWall .image[data-client="' + data.client + '"]').length == 0) {
            $('#imageWall').append('<div class="image" data-self="true" data-client="' + data.client + '"><img src=' + data.image + '><p></p></div> ')
            $('#imageWall .image[data-client="' + data.client + '"] img').load(function () {

                if ((-width / 2 < x <= width / 2) && (-height / 2 < y <= height / 2)) {
                    $(this).parent().css({
                        left: origin.left + x * defaultSize.width + 'px',
                        top: origin.top + y * defaultSize.height + 'px'
                    });
                    $(this).parent().addClass('animate');
                    $(this).unbind('load');
                }

                if (x === y || (x < 0 && x === -y) || (x > 0 && x === 1 - y)) {
                    // change direction
                    delta = [-delta[1], delta[0]]
                }

                x += delta[0];
                y += delta[1];

                if (x > bodySize.maxX) {
                    bodySize.maxX = x;
                }
                if (y > bodySize.maxY) {
                    bodySize.maxY = y;
                }
                if (x < bodySize.minX) {
                    bodySize.minX = x;
                    calculateMarginX(x,img);
                }
                if (y < bodySize.minY) {
                    bodySize.minY = y;
                    calculateMarginY(y,img);
                }
            })
        } else {
            $('#imageWall .image[data-client="' + data.client + '"]').removeClass('animate')
            setTimeout(function () {
                $('#imageWall .image[data-client="' + data.client + '"] img').attr('src', data.image)
                $('#imageWall .image[data-client="' + data.client + '"]').addClass('animate')
            }, 150);

        }
        $('.locate').show();
    }
});

socket.on('imageFiltered', function (data) {
    $('#imageWall .image[data-client="' + data.client + '"]').removeClass('animate')
    setTimeout(function () {

        $('#imageWall .image[data-client="' + data.client + '"] img').attr('src', data.image + '?i=' + Date.now())
        $('#imageWall .image[data-client="' + data.client + '"]').addClass('animate');
    }, 150);

});
socket.on('messageSent', function (data) {
    if (data.message) {

        if ($('#imageWall .image[data-client="' + data.client + '"] p').length != 0) {
            $('#imageWall .image[data-client="' + data.client + '"] p').html(data.message)
        } else {
            $('#imageWall .image[data-client="' + data.client + '"]').append("<p>" + data.message + "</p>")
        }
    } else {
        $('#imageWall .image[data-client="' + data.client + '"] p').remove();
    }
});