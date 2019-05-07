// GPU-accelerated scrollTop
// Isolate from http://wibblystuff.blogspot.ca/2014/04/in-page-smooth-scroll-using-css3.html
(function ($) {
    "use strict";
    var events = 'transitionend webkitTransitionEnd msTransitionEnd oTransitionEnd',
        $html = $('html'),
        $window = $(window);

    $.fn.wScrollTop = function (scroll) {
        $html
            .css({
                'margin-top' : ($window.scrollTop() - scroll) + 'px',
                // Appears faster than ease-in-out
                'transition' : 'all 800ms cubic-bezier(0.85, 0.18, 0.12, 0.85)'
            })
            .data('transitioning', true)
            .on(events, function (e) {
                if (e.target !== e.currentTarget) {
                    return;
                }
                if ($(this).data('transitioning') !== true) {
                    return;
                }
                $(this).removeAttr('style').data('transitioning', false);
                $("html, body").scrollTop(scroll);
                $html.off(events);
            });
    };
}(window.jQuery));
