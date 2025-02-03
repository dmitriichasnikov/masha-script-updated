/* ================================================
   scripts-updated.js
   ================================================ */

   var tranittype = 0;
   let screenWidth = window.innerWidth;
   
   // Запуск Barba.js после полной загрузки DOM
   document.addEventListener("DOMContentLoaded", function () {
     Barba.Pjax.start();
     Barba.Prefetch.init();
   
     // Определяем класс анимации перехода
     var FadeTransition = Barba.BaseTransition.extend({
       start: function () {
         // Последовательность действий
         this.newContainerLoading
           .then(this.perehod.bind(this))
           .then(this.fadeOut.bind(this))
           .then(this.fadeIn.bind(this));
       },
   
       // Добавляем класс, который отключает клики и т.п.
       perehod: function () {
         $('body').addClass('transited');
       },
   
       // Исчезновение старого контейнера
       fadeOut: function () {
         if (tranittype == 0) {
           // Если tranittype == 0, не делаем fadeOut-анимацию.
         } else {
           // Если tranittype != 0, проверяем ширину экрана
           if (screenWidth > 992) {
             // Для больших экранов
             return $(this.oldContainer).animate({"opacity": "1"}, 1500).promise();
           } else {
             // Для мобильных
             return $(this.oldContainer).animate({"opacity": "0"}, 500).promise();
           }
         }
       },
   
       // Появление нового контейнера
       fadeIn: function () {
         $(window).scrollTop(0); // Скроллим наверх
         var _this = this;
         _this.done();           // Сообщаем Barba, что переход завершён
   
         // Запускаем дополнительные функции
         allPage();
         startsingle();
   
         // Возвращаем интерактивность
         $('body').removeClass('transited');
   
         // Переинициализация Webflow-анимаций (если нужно)
         window.Webflow && window.Webflow.destroy();
         window.Webflow && window.Webflow.ready();
         window.Webflow && window.Webflow.require('ix2').init();
   
         // Сбрасываем тип перехода и возвращаем скролл
         tranittype = 0;
         $('html').css('overflow', 'visible');
       }
     });
   
     // Привязываем класс перехода к Barba
     Barba.Pjax.getTransition = function () {
       return FadeTransition;
     };
   
     // После загрузки новой страницы
     Barba.Dispatcher.on('newPageReady', function (currentStatus, oldStatus, container, newPageRawHTML) {
       // Заменяем <html> на <nothtml>, чтобы вытащить атрибут data-wf-page
       var response = newPageRawHTML.replace(/(<\/?)html( .+?)?>/gi, '$1nothtml$2>', newPageRawHTML);
       var bodyClasses = $(response).filter('nothtml').attr('data-wf-page');
       $('html').attr('data-wf-page', bodyClasses);
     });
   });
   
   // Когда вся страница загружена (включая картинки и ресурсы)
   window.addEventListener("load", (event) => {
     allPage();
     startsingle();
   });
   
   
   // --- Функция для «общих» страниц
   function allPage(){
   
     /*
      // Ранее здесь фиксировались размеры блоков .cms-item-img_mom и позиция .cms-image_mom
      // Закомментировано, чтобы не влиять на размеры.
   
      setTimeout(function () {
        $(".cms-item-img_mom").each(function() {
          var height = $(this).height();
          $(this).css({'height' : height+'px'});
        });
   
        $(".cms-item").each(function() {
          var offset = $(this).position();
          var width = $(this).width();
          var left = offset.left;
          var top = offset.top;
          $(this).children().children('.cms-image_mom').css({
            'position' : 'absolute',
            'left' : left+'px',
            'top' : top+'px',
            'width' : width+'px'
          });
        });
      }, 1000);
     */
   
     // При клике на .cms-item-img_mom устанавливаем флаг, что переход особый
     $(".cms-item-img_mom").on("click", function() {
       tranittype = 1;
     });
   
     // Анимация при клике на .cms-image_mom (перемещение без изменения ширины)
     $(".cms-image_mom").on("click", function() {
       $('html').css('overflow','hidden');
   
       // Вычисляем позицию, куда сместить элемент
       var scroller = window.pageYOffset;
       var remer = $('#remer').height();
       var scrollerer = scroller + remer;
   
       // Анимируем через Velocity
       $(this).velocity({
         left: "6rem",
         top: scrollerer
         // width: "807rem" // Убрано, чтобы не увеличивать/фиксировать
       }, {
         easing: "ease",
         delay: 500,
         duration: 500
       });
   
       // Скрываем все .cms-item, кроме текущего
       var $this = $(this).parent().parent();
       $(".cms-item").not($this).addClass('hider');
     });
   }
   
   
   // --- Функция для «single-page»
   function startsingle(){
     // Проявляем .single-image с «цепочкой» по индексу через transition-delay
     $(".single-image").each(function(index) {
       var trand = index * 100;
       $(this).css({'transition-delay': trand + 'ms'});
       $(this).addClass('visibler');
     });
   
     // Кликаем на .a-aimge – скроллим к соответствующей .single-image
     $(".a-aimge").on("click", function() {
       var index = $(this).index();
       var top = $('.single-image').eq(index).offset().top;
       $("html, body").stop().animate({scrollTop: top}, 800, 'swing');
     });
   
     // IntersectionObserver: изменяем #name при появлении .single-image в зоне видимости
     document.querySelectorAll('.single-image').forEach((trigger) => {
       new IntersectionObserver((entries) => {
         entries.forEach((entry) => {
           if (entry.isIntersecting) {
             var name = $(entry.target).find('.mm-name').text();
             $('#name').text(name);
           }
         });
       }, { threshold: 0.51 }).observe(trigger);
     });
   
     // Анимация появления .a-aimge (с помощью GSAP)
     $(".a-aimge").each(function(index) {
       var element = $(this);
       gsap.fromTo(element,
         { x: '250px', y: '0px', rotationY: 285 + index, opacity: 0 },
         {
           x: '0px',
           y: '0px',
           rotationY: 0,
           opacity: 1,
           ease: Power4.easeOut,
           duration: 1.6,
           delay: index * 0.1
         }
       );
     });
   }
   
