document.addEventListener("DOMContentLoaded", () => {
    const app = new application();
    app.init();
});

function application() {
    //variable
    //this.myMap;
}
application.prototype.init = function () {
    this.initFancyBehavior();
    this.initStarRate();
    this.initReadmoreReview();
};

// Initialization custom fancy behavior
application.prototype.initFancyBehavior = function () {
    const body = $('body');
    const fancybox = $('[data-fancybox]');
    const burger = $('[data-menu-spoiler]');
    const menu = $('[data-menu]');
    const catalog = $('[data-catalog]');
    const catalogSpoiler = $('[data-catalog-spoiler]');

    fancybox.on('click', function () {
        let currentSrc = $(this).data('src');

        menu.removeClass('active');
        burger.removeClass('active');
        burger.attr('aria-expanded', 'false');
        burger.attr('aria-label', 'Открыть меню');
        catalog.removeClass('active');
        catalogSpoiler.attr('aria-expanded', 'false');
        catalogSpoiler.attr('aria-label', 'Открыть меню');
        $('.overlay').remove();
        $('.overlay-transparent').remove();

        $('.modal').not(currentSrc).closest('.fancybox__container.is-animated').click();
    });

    $(document).on('click', function (e) {
        if ($('.fancybox__slide.is-selected.has-inline').is(e.target) || $('.fancybox__slide .carousel__button.is-close').is(e.target)) {
            body.removeClass('overflow-hidden');
            return application.prototype.enableScroll();
        }
    });
};

// Initialization star-rating
application.prototype.initStarRate = function () {
    if ($('[data-star-rate]').length) {
        $('[data-star-rate]').each(function (i) {
            const rating = $(this).find('.star-rating');
            const value = parseInt($(this).find('.star-rating-value').data("value"));

            switch (value) {
                case 0:
                    rating.addClass('star-rating-0');
                    break;
                case 1:
                    rating.addClass('star-rating-1');
                    break;
                case 2:
                    rating.addClass('star-rating-2');
                    break;
                case 3:
                    rating.addClass('star-rating-3');
                    break;
                case 4:
                    rating.addClass('star-rating-4');
                    break;
                case 5:
                    rating.addClass('star-rating-5');
                    break;
                default:
                    rating.addClass('star-rating-0');
            }
        });
    }
};

// Initialization readmore plugin
application.prototype.initReadmoreReview = function () {
    if ($('[data-spoiler]').length) {
        const spoiler = $('[data-spoiler]');

        spoiler.each(function (i) {
            let moreHref = $(this).data('more-href');
            let defaultHeight = 174;
            let defaultMoreText = 'Читать весь отзыв';
            let defaultLessText = 'Скрыть';
            let currentElemHeight = spoiler.eq(i).data('collapsed-height');

            if (currentElemHeight === '' || currentElemHeight === null || currentElemHeight === undefined) {
                currentElemHeight = defaultHeight;
            }

            spoiler.eq(i).addClass('spoiler-' + i);
            $('.spoiler-' + i).readmore({
                collapsedHeight: currentElemHeight,
                moreLink: '<div class="spoiler-more-wrapper">\n' +
                    '          <a class="spoiler-more" href="javascript:;">\n' +
                    '               <span class="text-content">' + defaultMoreText + '</span>\n' +
                    '               <svg class="icon">\n' +
                    '                   <use href="/local/templates/pulssar/img/chevron-right-review.svg#chevron-right-review"></use>\n' +
                    '               </svg>\n' +
                    '           </a>\n' +
                    '       </div>',
                lessLink: '<div class="spoiler-more-wrapper">\n' +
                    '          <a class="spoiler-more" href="javascript:;">\n' +
                    '               <span class="text-content">' + defaultLessText + '</span>\n' +
                    '               <svg class="icon">\n' +
                    '                   <use href="/local/templates/pulssar/img/chevron-right-review.svg#chevron-right-review"></use>\n' +
                    '               </svg>\n' +
                    '           </a>\n' +
                    '       </div>',
            });
        });
    }
};