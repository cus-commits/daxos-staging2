(function($) {
    'use strict';
    $(function() {
        $(".open-popup").fullScreenPopup({
            bgColor: 'rgba(0, 0, 0, 0.8)'
        });
    });


    $("w-nav-icon").click(function() {
        $("#page-header").toggleClass("toggle-main");
    });

    $(".vc_column-inner .ultimate-typed-main, .vc_column-inner .typed-cursor").wrap("<div class='typed-wrapper'></div>");

    AOS.init();

    $(document).ready(function() {

        function toggleSidebar() {
            $(".daxos-menu .nav-button").toggleClass("active");
            $("body").toggleClass("nav-active");

            $(".daxos-menu-sidebar.sidebar-item").toggleClass("active");
        }

        $(".daxos-menu .nav-button").on("click tap", function() {
            toggleSidebar();
        });

        $(document).keyup(function(e) {
            if (e.keyCode === 27) {
                toggleSidebar();
            }
        });

    });

})(jQuery);