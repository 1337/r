(function ($) {
    $.fn.scrollStopped = function (callback) {
        // stackoverflow.com/a/14035162/1558430
        $(this).scroll(function () {
            var self = this, $this = $(self);
            if (!callback) {
                return;
            }
            if ($this.data('scrollTimeout')) {
                clearTimeout($this.data('scrollTimeout'));
            }
            $this.data('scrollTimeout', setTimeout(callback, 300, self));
        });
    };
}(this.jQuery || this.$));
