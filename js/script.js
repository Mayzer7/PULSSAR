jQuery(document).ready(function($) {
	$(".imageDots a").hover(function() {
		var parent = $(this).parents(".uk-slideshow");
		var index = $(this).parent().attr("uk-slideshow-item");
		UIkit.slideshow(parent).show(index);
	});

	$(".productItem .productImg").mouseleave(function() {
		var parent = $(this).find(".uk-slideshow");
		UIkit.slideshow(parent).show(0);
	});
	
	$(document).on('focus', ".inputGroup input, .inputGroup textarea", function() {
		$(this).parent().addClass("active completed");
	});

	$(document).on('focusout', ".inputGroup input, .inputGroup textarea", function() {
    	if($(this).val() === "") $(this).parent().removeClass("completed");
    	$(this).parent().removeClass("active");
	});

	$(window).scroll(function() {
		if($(this).scrollTop() != 0) {
			$('.toTopWrap').fadeIn();
		} else {
			$('.toTopWrap').fadeOut();
		}
	});

	$('.prodQuant .plus button').click(function () {
		var $input = $(this).parents(".prodQuant").find('input');
		if (parseInt($input.val()) >= parseInt($input.attr("max"))) {
			var res = '<div class="uk-flex-top" data-uk-modal><div class="uk-modal-dialog uk-modal-body uk-margin-auto-vertical"><button class="uk-modal-close-default" type="button" data-uk-close></button><p class="uk-text-center">Вы выбрали максимальное количество товара</p></div></div>';
			UIkit.modal(res).toggle();
			return false;
		}
		$input.val(parseInt($input.val()) + 1);
		$input.change();
		return false;
	});

	$('.prodQuant .minus button').click(function () {
		var $input = $(this).parents(".prodQuant").find('input');
		var count = parseInt($input.val()) - 1;
		count = count < 1 ? 1 : count;
		$input.val(count);
		$input.change();
		return false;
	});

	$(document).on('click', '.toFav, .detailFavorite', function(event) {
    	event.preventDefault();
    	var id = $(this).attr("data-id"),
			$this = $(this);

		$.ajax({
			url: '/local/ajax/fav.php',
			type: 'POST',
			dataType: 'json',
			data: {id: id},
		}).done(function(res) {
            console.log(res)
			$this.toggleClass('active');
			if ($('.headerFav .counter').length > 0) {
				$('.headerFav .counter').text(res);
			} else {
				$('.headerFav').append('<span class="counter">'+res+'</span>');
			}
		});
    });

	/*function search(q) {
		if (q == "") return;
		$.ajax({
	        type: "POST",
	        url: "/local/ajax/search.php",
	        data: "q="+q,
	        dataType: 'json',
	        success: function(json){
				$('#searchResults, #searchResultsMobile').html('');
				console.log(json);
	            if (json.sections.length) {
	            	$('#searchResults').append('<p class="miniTitle searchSectionTitle searchCatTogle">Категории ('+json.sections.length+')<i data-uk-icon="chevron-down"></i></p><div class="searchCategories" style="display:none;"></div>');
		            $.each(json.sections, function(index, element) {
		                $('.searchCategories').append('<div><a href="'+element.SECTION_PAGE_URL+'" class="searchSection">'+element.NAME+' <span>'+element.CNT+'</span></a></div>');
		            });
	            }
	            if (json.elements.length) {
	            	$('#searchResults').append('<p class="miniTitle searchSectionTitle">Товары ('+json.elements.length+')</p><div class="uk-child-width-1-4@m uk-child-width-1-2@s uk-grid-collapse" id="searchProducts" data-uk-grid></div>');
		            $.each(json.elements, function(index, element) {
		            	$('#searchProducts').append('<div><div class="uk-child-width-1-2 uk-grid-small" data-uk-grid><div class="uk-width-auto"><div class="uk-position-relative"><a href="'+element.DETAIL_PAGE_URL+'"><img src="#" data-src="'+element.PREVIEW_PICTURE+'" alt="" data-uk-img></a>'+element.LABEL+'</div></div><div><a href="'+element.DETAIL_PAGE_URL+'" class="searchTitle">'+element.NAME+'</a>'+element.NALICHIE+'<div class="searchPrice">'+element.PRICE+'</div><a href="'+element.DETAIL_PAGE_URL+'" class="btn brownBtn smallBtn">Заказать</a></div></div></div>');
		                

		            });
	            }
	        }
	    });
	}

	$('#title-search-input').keyup(function() {
		q = $(this).val();
		console.log(q)
		if (q.length > 2) {
			setTimeout(search(q), 1000);
		}
    });

	function searchMobile(q) {
		if (q == "") return;
		$.ajax({
	        type: "POST",
	        url: "/local/ajax/search.php",
	        data: "q="+q,
	        dataType: 'json',
	        success: function(json){
				$('#searchResults, #searchResultsMobile').html('');
				
	            if (json.sections.length) {
	            	$('#searchResultsMobile').append('<p class="miniTitle searchSectionTitle">Категории ('+json.sections.length+')</p><div class="searchCategories"></div>');
		            $.each(json.sections, function(index, element) {
		                $('.searchCategories').append('<div><a href="'+element.SECTION_PAGE_URL+'" class="searchSection">'+element.NAME+' <span>'+element.CNT+'</span></a></div>');
		            });
	            }
	            if (json.elements.length) {
	            	$('#searchResultsMobile').append('<p class="miniTitle searchSectionTitle">Товары ('+json.elements.length+')</p><div class="uk-child-width-1-1" id="searchProductsMobile" data-uk-grid></div>');
		            $.each(json.elements, function(index, element) {
						$('#searchProductsMobile').append('<div><div class="uk-grid-small" data-uk-grid><div class="uk-width-auto"><div class="uk-position-relative"><a href="'+element.DETAIL_PAGE_URL+'"><img src="#" data-src="'+element.PREVIEW_PICTURE+'" alt="" data-uk-img></a>'+element.LABEL+'</div></div><div class="uk-width-expand"><a href="'+element.DETAIL_PAGE_URL+'" class="searchTitle">'+element.NAME+'</a>'+element.NALICHIE+'<div class="searchPrice">'+element.PRICE+'</div><a href="'+element.DETAIL_PAGE_URL+'" class="btn brownBtn smallBtn">Заказать</a></div></div></div>');
		                

		            });
	            }
	        }
	    });
	}

	$('#title-search-input-mobile').keyup(function() {
		q = $(this).val();
		if (q.length > 2) {
			setTimeout(searchMobile(q), 1000);
		}
    });

    $('body').on('click', '.searchCatTogle', function(event) {
        
        $(this).next().slideToggle();
    });

    UIkit.util.on('#headerSearchWrap', 'hide', function () {
	    $('#searchResults').html('');
	});*/

    UIkit.util.on('#headerSearchWrap', 'show', function () {
	    $('#title-search-input').focus();
	});


	$(document).on('click', '.detailBuyBtn', function(event) {
        event.preventDefault();
        
        let prodData = {
            id: $(this).attr("data-offercart"),
            quant: $('.roznQuant').val()
        };

        $.ajax({
            url: '/local/ajax/add2basket.php',
            type: 'POST',
            dataType: 'json',
            data: prodData,
            success: function (data) {
                UIkit.notification({message: data.res, pos: 'top-right'});
                BX.onCustomEvent('OnBasketChange');
            },
            error: function(jqXHR, exception)
            {
            	if (jqXHR.status === 0) {
            		alert('НЕ подключен к интернету!');
            	} else if (jqXHR.status == 404) {
            		alert('НЕ найдена страница запроса [404])');
            	} else if (jqXHR.status == 500) {
            		alert('НЕ найден домен в запросе [500].');
            	} else if (exception === 'parsererror') {
            		alert("Ошибка в коде: \n"+jqXHR.responseText);
            	} else if (exception === 'timeout') {
            		alert('Не ответил на запрос.');
            	} else if (exception === 'abort') {
            		alert('Прерван запрос Ajax.');
            	} else {
            		alert('Неизвестная ошибка:\n' + jqXHR.responseText);
            	}
            }
        })
        .done(function(data) {
            console.log("success");
            console.log(data);
        })
        .fail(function(data) {
            console.log("error");
            console.log(data);
        })
        .always(function(data) {
            console.log("complete");
            console.log(data);
        });
        
    });


    // ---------------------------------------------------------
    // Auth modal
    // ---------------------------------------------------------
    var auth_url = '/local/ajax/auth.php';
    var auth_timeout = 5000;
    var auth_error_timeout = 'Внимание! Время ожидания ответа сервера истекло';
    var auth_error_default = 'Внимание! Произошла ошибка, попробуйте отправить информацию еще раз';

    $('#auth-modal').on('submit','form',function(){

        $.ajax({
            type: "POST",
            url: auth_url,
            data: $(this).serializeArray(),
            timeout: auth_timeout,
            error: function(request,error) {
                if (error == "timeout") {
                    alert(auth_error_timeout);
                }
                else {
                    alert(auth_error_default);
                }
            },
            success: function(data) {
                $('#auth-modal .uk-modal-content').html(data);
                $('#auth-modal .backurl').val(window.location.pathname);
            }
        });

        return false;
    });

    $('#auth-modal').on('click','.ajax-link',function(){

        $.ajax({
            type: "GET",
            url: $(this).attr('href'),
            timeout: auth_timeout,
            error: function(request,error) {
                if (error == "timeout") {
                    alert(auth_error_timeout);
                }
                else {
                    alert(auth_error_default);
                }
            },
            success: function(data) {
                $('#auth-modal .uk-modal-content').html(data);
                $('#auth-modal .backurl').val(window.location.pathname);
            }
        });

        return false;
    });

    $('#auth-modal').on('click','.reload-captcha',function(){

        var reload_captcha = $(this);
        reload_captcha.find('.uk-icon-refresh').addClass('uk-icon-spin');

        $.ajax({
            type: "GET",
            url: $(this).attr('href'),
            timeout: auth_timeout,
            error: function(request,error) {
                if (error == "timeout") {
                    alert(auth_error_timeout);
                }
                else {
                    alert(auth_error_default);
                }
            },
            success: function(data) {
                $('#auth-modal .bx-captcha').html(data);
                reload_captcha.find('.uk-icon-refresh').removeClass('uk-icon-spin');
            }
        });

        return false;
    });

    $('#auth-modal').on({

        'show.uk.modal': function(modal){

            //login form
            $.ajax({
                type: "POST",
                url: auth_url,
                timeout: auth_timeout,
                error: function(request,error) {
                    if (error == "timeout") {
                        alert(auth_error_timeout);
                    }
                    else {
                        alert(auth_error_default);
                    }
                },
                success: function(data) {
                    $(modal.target).find('.uk-modal-content').html(data);
                    $(modal.target).find('.backurl').val(window.location.pathname);
                }
            });
        },

        'hide.uk.modal': function(){
            //Empty
        }
    });

    $('.toggleSubMenu').click(function(event) {
        var parent = $(this).parents("li");
        parent.find('.uk-nav-sub').slideToggle();
        $(this).toggleClass('active');
    });

    if (document.querySelector(".form_send_image") !== null) {

		if (document.querySelector(".form_send_image__close") !== null) {
			document.querySelector('.form_send_image__close').addEventListener( 'click', function () {
	            document.querySelector(".form_send_image").style.display='none';
	        });
	    }

		if (document.querySelector(".form_send_image__open") !== null) {
	        document.querySelector('.form_send_image__open').addEventListener( 'click', function () {
	            document.querySelector(".form_send_image").style.display='flex';
	        });
	    }

    }

  const isMobileX = window.innerWidth < 768;
  if (!isMobileX) {
	document.querySelectorAll(".topLineTel").forEach((el)=>{el.removeAttribute('href');})
  }


    $( ".cookie-banner" ).on( "click", function(){
        document.querySelector(".cookie-banner").style.display = "none";
        
        const expirationDate = new Date();
        expirationDate.setTime(expirationDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        document.cookie = "cookieNoticeClosed=true; expires=" + expirationDate.toUTCString() + "; path=/";

    });

    if (!document.cookie.includes("cookieNoticeClosed=true")) {
        document.querySelector(".cookie-banner").style.display = "flex";
        console.log('cookieY');
    }
});

