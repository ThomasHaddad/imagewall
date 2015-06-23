$(function () {
    var x = 0,
        y = 0,
        delta = [0, -1],
        bodySize = {
            minX: 0,
            maxX: 0,
            minY: 0,
            maxY: 0
        };
    var width = 1000;
    var height = 1000;
    var margin = {
        left: 0,
        top: 0
    };
    var defaultSize = {
        width: 200,
        height: 150
    };
    var origin = {
        left: (window.innerWidth / 2) - (defaultSize.width / 2),
        top: (window.innerHeight / 2) - (defaultSize.height / 2)
    };
    var img;

    function calculateMarginX(x) {
        if (x < 0 && origin.left < Math.abs(x * defaultSize.width)) {
            margin.left = Math.abs(x * defaultSize.width) - origin.left;
            $('#imageWall').css({
                'margin-left': margin.left + "px",
                width: ((Math.abs(bodySize.minX) + Math.abs(bodySize.maxX)+1) * defaultSize.width)-margin.left + "px",
                height: ((Math.abs(bodySize.minY) + Math.abs(bodySize.maxY)+1) * defaultSize.height)-margin.top+ "px"
            });
        }

    }

    function calculateMarginY(y) {
        if (y < 0 && origin.top < Math.abs(y * defaultSize.height)) {
            margin.top = Math.abs(y * defaultSize.height) - origin.top;
            $('#imageWall').css({
                'margin-top': margin.top + "px",
                width: ((Math.abs(bodySize.minX) + Math.abs(bodySize.maxX)+1) * defaultSize.width)-margin.left + "px",
                height: ((Math.abs(bodySize.minY) + Math.abs(bodySize.maxY)+1) * defaultSize.height)-margin.top+ "px"
            });
        }
    }


    // draggable wall


    $(window).off("scroll");
    // Draw spiral when images are loaded
    $(window).load(function () {
        if (images.length) {
            for (var i = 0; i <= images.length; i++) {
                img = $('#imageWall .image').eq(i);
                if ((-width / 2 < x <= width / 2)
                    && (-height / 2 < y <= height / 2)) {
                    if (img.length) {
                        if (
                            x + 1 < 0 && origin.left < Math.abs((x + 1) * defaultSize.width)
                            || y + 1 < 0 && origin.top < Math.abs((y + 1) * defaultSize.height)
                            || x > 0 && window.innerWidth / 2 < Math.abs(x * defaultSize.width)
                            || y > 0 && window.innerHeight / 2 < Math.abs(y * defaultSize.height)

                        ) {
                            img.css({
                                left: origin.left + x * defaultSize.width + 'px',
                                top: origin.top + y * defaultSize.height + 'px'
                            });
                            img.addClass('not');
                        } else {
                            img.css({
                                left: origin.left + x * defaultSize.width + 'px',
                                top: origin.top + y * defaultSize.height + 'px'
                            }).delay(100 * i).queue(function (x, y) {
                                $(this).addClass('animate');
                            });
                        }
                    } else {

                        $("body").scrollTo({
                            top: (margin.top + origin.top - (window.innerHeight / 2) + defaultSize.height / 2) + "px",
                            left: (margin.left + origin.left - (window.innerWidth / 2) + (defaultSize.width / 2)) + "px"
                        });

                        break;
                    }
                }

                if (x === y
                    || (x < 0 && x === -y)
                    || (x > 0 && x === 1 - y)) {
                    // change direction
                    delta = [-delta[1], delta[0]]
                }

                if (x > bodySize.maxX) {
                    bodySize.maxX = x;
                }
                if (y > bodySize.maxY) {
                    bodySize.maxY = y;
                }
                if (x < bodySize.minX) {
                    bodySize.minX = x;
                    calculateMarginX(x, img);
                }
                if (y < bodySize.minY) {
                    bodySize.minY = y;
                    calculateMarginY(y, img);
                }
                x += delta[0];
                y += delta[1];
            }
        }
    });
    setTimeout(function () {

        $(window).scroll(function (e) {
            if (e.originalEvent) {
                $('.not').each(function () {
                    if ($(this).visible(true)) {
                        $(this).addClass('animate').removeClass('not');
                    }
                })
            }
        });
    }, 200);




    // fullscreen
    var fullscreen = false;
    $('#fullscreen').on('click', function (e) {
        e.preventDefault();
        if (!fullscreen) {
            launchIntoFullscreen(document.documentElement); // the whole page
            fullscreen = true;
            $(this).html('Quitter le plein écran');
        } else {
            fullscreen = false;
            exitFullscreen();
            $(this).html('Plein Ecran');
        }
    });
    function launchIntoFullscreen(element) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }

    function exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }

    var ownImage = $(".image[data-self='true']");
    // hide if no pictures were updated yet
    if (!client || $(".image[data-self='true']").length == 0) {
        $('.locate').hide();
    }
    // Locate button
    $('.locate').on('click', function (e) {
        e.preventDefault();
        ownImage = $(".image[data-self='true']");
        $("body").scrollTo({
            top: ownImage.position().top + margin.top - (window.innerHeight / 2) + (defaultSize.height) + "px",
            left: ownImage.position().left + margin.left - (window.innerHeight / 2) + (defaultSize.width / 2) + "px"
        }, 800, {
            onAfter: function () {
                $(".image[data-self='true']").removeClass('animate');
                setTimeout(function () {
                    $(".image[data-self='true']").addClass('animate');
                }, 150);
            }
        });
    });


    //navigation drag
    var clicked = false, moving = false, clickY, clickX, oldPageX, oldPageY, deltaX, deltaY;
    $.easing.easeOutExpo = function (x, t, b, c, d) {
        return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
    };
    $("#imageWall").on({
        'mousemove': function (e) {
            if (clicked) updateScrollPos(e);
        },
        'mousedown': function (e) {
            e.preventDefault();
            clicked = true;
            clickY = e.pageY;
            clickX = e.pageX;
        },
        'mouseup': function (e) {
            clicked = false;
            if (moving) {
                $('html').css('cursor', 'auto');
                deltaX = e.pageX - oldPageX;
                deltaY = e.pageY - oldPageY;
                $(window).scrollTo({
                    top: $(window).scrollTop() + (5 * deltaY),
                    left: $(window).scrollLeft() + (5 * deltaX)
                }, 550, {easing: 'easeOutExpo'});
                moving = false;
            }

        }
    });

    var updateScrollPos = function (e) {
        moving = true;
        oldPageX = e.pageX;
        oldPageY = e.pageY;
        $('html').css('cursor', 'crosshair');
        $(window).scrollTo({
            top: $(window).scrollTop() + (clickY - e.pageY),
            left: $(window).scrollLeft() + (clickX - e.pageX)
        });
    };
    var socket = io();
    socket.on("imageAdded", function (data, buffer) {

        if (data.image) {

            if ($('#imageWall .image[data-client="' + data.client + '"]').length == 0) {
                $('#imageWall').append('<div class="image" data-client="' + data.client + '"><img src=' + data.image.formatedUrl + '><p></p></div> ');
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
                    $('#imageWall .image[data-client="' + data.client + '"] img').attr('src', data.image.formatedUrl)
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

});