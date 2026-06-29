/**
 * gallery.js — 图片画廊组件
 * 支持缩略图网格展示、lightbox 大图查看、键盘导航
 */

var Gallery = (function () {
  'use strict';

  /* ---------- 状态变量 ---------- */
  var gridId     = '';     // 缩略图网格容器的 DOM ID
  var lightboxId = '';     // Lightbox 弹层的 DOM ID
  var images     = [];     // 当前加载的图片数据数组 [{file, label, fullPath}]
  var currentIndex = 0;   // 当前 lightbox 显示的图片索引

  /* ---------- DOM 辅助函数 ---------- */

  /**
   * 获取 Lightbox 内部元素
   */
  function getLightbox() {
    return document.getElementById(lightboxId);
  }

  function getLightboxImg() {
    var lb = getLightbox();
    return lb ? lb.querySelector('.lightbox-img') : null;
  }

  function getLightboxCaption() {
    var lb = getLightbox();
    return lb ? lb.querySelector('.lightbox-caption') : null;
  }

  function getLightboxPrev() {
    var lb = getLightbox();
    return lb ? lb.querySelector('.lightbox-prev') : null;
  }

  function getLightboxNext() {
    var lb = getLightbox();
    return lb ? lb.querySelector('.lightbox-next') : null;
  }

  function getLightboxClose() {
    var lb = getLightbox();
    return lb ? lb.querySelector('.lightbox-close') : null;
  }

  /* ---------- 公开方法 ---------- */

  /**
   * 初始化画廊
   * @param {string} gId - 缩略图网格的 DOM 元素 ID
   * @param {string} lId - Lightbox 弹层的 DOM 元素 ID
   */
  function init(gId, lId) {
    gridId     = gId;
    lightboxId = lId;

    // 绑定 lightbox 按钮事件
    var prevBtn  = getLightboxPrev();
    var nextBtn  = getLightboxNext();
    var closeBtn = getLightboxClose();
    var lightbox = getLightbox();

    if (prevBtn) {
      prevBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        prevImage();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        nextImage();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        closeLightbox();
      });
    }

    // 点击 overlay 背景关闭
    if (lightbox) {
      lightbox.addEventListener('click', function (e) {
        // 仅在点击背景（而非图片或按钮）时关闭
        if (e.target === lightbox || e.target.classList.contains('lightbox-inner')) {
          closeLightbox();
        }
      });
    }

    // 键盘操作：ESC 关闭，左右箭头切换
    document.addEventListener('keydown', function (e) {
      // 仅在 lightbox 活跃时响应
      var lb = getLightbox();
      if (!lb || !lb.classList.contains('active')) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevImage();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextImage();
      }
    });
  }

  /**
   * 加载图片数组并渲染缩略图网格
   * @param {Array}  imageArray - 图片数据数组 [{file, label}]
   * @param {string} basePath   - 图片文件的基础路径
   */
  function loadImages(imageArray, basePath) {
    var grid = document.getElementById(gridId);
    if (!grid) return;

    images = imageArray.map(function (img) {
      return {
        file: img.file,
        label: img.label || '',
        fullPath: basePath + img.file
      };
    });

    // 清空网格
    grid.innerHTML = '';

    // 生成缩略图卡片
    images.forEach(function (img, index) {
      var thumb = document.createElement('div');
      thumb.className = 'gallery-item';
      thumb.setAttribute('data-index', index);
      thumb.innerHTML =
        '<img src="' + img.fullPath + '" alt="' + img.label + '" loading="lazy">' +
        '<div class="gallery-label">' + img.label + '</div>';

      // 点击打开 lightbox
      thumb.addEventListener('click', function () {
        openLightbox(index);
      });

      grid.appendChild(thumb);
    });
  }

  /**
   * 打开 Lightbox 显示大图
   * @param {number} index - 要显示的图片索引
   */
  function openLightbox(index) {
    if (index < 0 || index >= images.length) return;

    currentIndex = index;
    var img     = getLightboxImg();
    var caption = getLightboxCaption();
    var lightbox = getLightbox();

    if (img) {
      img.src   = images[index].fullPath;
      img.alt   = images[index].label;
    }
    if (caption) {
      caption.textContent = images[index].label;
    }
    if (lightbox) {
      lightbox.classList.add('active');
      // 滚动到顶部，防止页面跳动
      document.body.style.overflow = 'hidden';
    }
  }

  /**
   * 关闭 Lightbox
   */
  function closeLightbox() {
    var lightbox = getLightbox();
    if (lightbox) {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  /**
   * 显示上一张图片
   */
  function prevImage() {
    if (images.length === 0) return;
    var newIndex = currentIndex - 1;
    if (newIndex < 0) newIndex = images.length - 1; // 循环到末尾
    openLightbox(newIndex);
  }

  /**
   * 显示下一张图片
   */
  function nextImage() {
    if (images.length === 0) return;
    var newIndex = currentIndex + 1;
    if (newIndex >= images.length) newIndex = 0; // 循环到开头
    openLightbox(newIndex);
  }

  /* ---------- 导出公共接口 ---------- */
  return {
    init: init,
    loadImages: loadImages,
    openLightbox: openLightbox,
    closeLightbox: closeLightbox,
    prevImage: prevImage,
    nextImage: nextImage
  };

})();
