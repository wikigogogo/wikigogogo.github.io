/**
 * pdf-viewer.js — PDF 查看器组件
 * 基于 PDF.js 4.x，支持高倍缩放、高清渲染、拖拽平移、键盘快捷键
 * 特别优化：工程图小字和细线需要高缩放与 2x/3x 渲染倍率
 */

var PDFViewer = (function () {
  'use strict';

  /* ---------- 常量 ---------- */
  var ZOOM_STEP    = 0.25;   // 每次缩放步长 25%
  var ZOOM_MIN     = 0.25;   // 最小缩放 25%
  var ZOOM_MAX     = 5.0;    // 最大缩放 500%
  var RENDER_SCALE = 3;      // 渲染倍率，确保工程图小字和细线清晰

  /* ---------- 状态变量 ---------- */
  var pdfDoc       = null;   // 当前加载的 PDF 文档对象
  var currentPage  = 1;      // 当前页码
  var totalPages   = 1;      // 总页数
  var scale        = 1.0;    // 当前缩放比例
  var rendering    = false;  // 是否正在渲染
  var containerId  = '';     // 画布容器 ID
  var toolbarPrefix = '';    // 工具栏按钮 ID 前缀
  var currentPdfUrl = '';    // 当前 PDF 的 URL，用于下载

  // 拖拽平移相关状态
  var isDragging    = false;
  var dragStartX    = 0;
  var dragStartY    = 0;
  var scrollStartX  = 0;
  var scrollStartY  = 0;
  var canvasWrapper = null;  // 画布外层可滚动容器

  /**
   * 获取工具栏元素的辅助函数
   */
  function getElem(suffix) {
    return document.getElementById(toolbarPrefix + suffix);
  }

  /**
   * 更新工具栏状态显示（缩放比例、页码）
   */
  function updateToolbar() {
    var zoomInfo = getElem('ZoomInfo');
    var pageInfo = getElem('PageInfo');
    if (zoomInfo) zoomInfo.textContent = Math.round(scale * 100) + '%';
    if (pageInfo) pageInfo.textContent = currentPage + ' / ' + totalPages;
  }

  /**
   * 渲染指定页面到 canvas
   * 使用高渲染倍率 (RENDER_SCALE) 确保工程图小字和细线清晰
   */
  function renderPage(pageNum) {
    if (!pdfDoc) return;
    rendering = true;

    var loading = getElem('Loading');
    var error   = getElem('Error');
    if (loading) loading.style.display = 'block';
    if (error) error.style.display = 'none';

    pdfDoc.getPage(pageNum).then(function (page) {
      var container = document.getElementById(containerId);
      if (!container) return;

      // 移除旧的 canvas
      var oldCanvas = container.querySelector('canvas');
      if (oldCanvas) oldCanvas.remove();

      // 获取容器可用宽度
      var containerWidth = container.clientWidth;

      // 计算视口
      var viewport = page.getViewport({ scale: scale });

      // 创建高清 canvas
      var canvas = document.createElement('canvas');
      var ctx    = canvas.getContext('2d');

      // 使用高渲染倍率保证清晰度
      var outputScale = Math.max(RENDER_SCALE, window.devicePixelRatio || 1);
      canvas.width  = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);

      // canvas 显示尺寸为实际视口大小
      canvas.style.width  = Math.floor(viewport.width) + 'px';
      canvas.style.height = Math.floor(viewport.height) + 'px';

      // 设置变换矩阵实现高清渲染
      var transform = outputScale !== 1
        ? [outputScale, 0, 0, outputScale, 0, 0]
        : null;

      var renderContext = {
        canvasContext: ctx,
        viewport: page.getViewport({ scale: scale }),
        transform: transform
      };

      page.render(renderContext).promise.then(function () {
        if (loading) loading.style.display = 'none';
        rendering = false;
        updateToolbar();
      }).catch(function () {
        if (loading) loading.style.display = 'none';
        if (error) error.style.display = 'block';
        rendering = false;
      });
    }).catch(function () {
      if (loading) loading.style.display = 'none';
      if (error) error.style.display = 'block';
      rendering = false;
    });
  }

  /**
   * 初始化拖拽平移功能
   */
  function initDragPan() {
    canvasWrapper = document.getElementById(containerId);
    if (!canvasWrapper) return;

    canvasWrapper.addEventListener('mousedown', function (e) {
      // 仅在按住鼠标左键时启用拖拽
      isDragging   = true;
      dragStartX   = e.clientX;
      dragStartY   = e.clientY;
      scrollStartX = canvasWrapper.scrollLeft;
      scrollStartY = canvasWrapper.scrollTop;
      canvasWrapper.style.cursor = 'grabbing';
      e.preventDefault();
    });

    window.addEventListener('mousemove', function (e) {
      if (!isDragging) return;
      var dx = e.clientX - dragStartX;
      var dy = e.clientY - dragStartY;
      canvasWrapper.scrollLeft = scrollStartX - dx;
      canvasWrapper.scrollTop  = scrollStartY - dy;
    });

    window.addEventListener('mouseup', function () {
      if (isDragging) {
        isDragging = false;
        if (canvasWrapper) {
          canvasWrapper.style.cursor = 'grab';
        }
      }
    });

    // 设置默认光标为 grab，提示用户可拖拽
    canvasWrapper.style.cursor = 'grab';
  }

  /**
   * 初始化鼠标滚轮缩放（Ctrl + 滚轮）
   */
  function initWheelZoom() {
    canvasWrapper = document.getElementById(containerId);
    if (!canvasWrapper) return;

    canvasWrapper.addEventListener('wheel', function (e) {
      // 仅在按住 Ctrl 时缩放，否则正常滚动
      if (!e.ctrlKey) return;

      e.preventDefault();

      if (e.deltaY < 0) {
        // 向上滚动 → 放大
        zoomIn();
      } else {
        // 向下滚动 → 缩小
        zoomOut();
      }
    }, { passive: false });
  }

  /* ---------- 公开方法 ---------- */

  /**
   * 初始化 PDF 查看器
   * @param {string} cId  - 画布容器的 DOM 元素 ID
   * @param {string} prefix - 工具栏按钮 ID 前缀（如 'pdf'）
   */
  function init(cId, prefix) {
    containerId   = cId;
    toolbarPrefix = prefix;

    // 绑定工具栏按钮事件
    var zoomInBtn    = getElem('ZoomIn');
    var zoomOutBtn   = getElem('ZoomOut');
    var fitWidthBtn  = getElem('FitWidth');
    var prevBtn      = getElem('Prev');
    var nextBtn      = getElem('Next');
    var downloadBtn  = getElem('Download');

    if (zoomInBtn)   zoomInBtn.addEventListener('click', zoomIn);
    if (zoomOutBtn)  zoomOutBtn.addEventListener('click', zoomOut);
    if (fitWidthBtn) fitWidthBtn.addEventListener('click', fitWidth);
    if (prevBtn)     prevBtn.addEventListener('click', prevPage);
    if (nextBtn)     nextBtn.addEventListener('click', nextPage);
    if (downloadBtn) downloadBtn.addEventListener('click', downloadPDF);

    // 初始化拖拽平移与滚轮缩放
    initDragPan();
    initWheelZoom();

    // 键盘快捷键
    document.addEventListener('keydown', function (e) {
      if (!pdfDoc) return;

      if (e.key === 'ArrowLeft') {
        prevPage();
      } else if (e.key === 'ArrowRight') {
        nextPage();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        zoomIn();
      } else if (e.key === '-') {
        e.preventDefault();
        zoomOut();
      }
    });
  }

  /**
   * 加载 PDF 文件
   * @param {string} url - PDF 文件的 URL
   */
  function loadPDF(url) {
    currentPdfUrl = url;
    currentPage  = 1;

    var loading = getElem('Loading');
    var error   = getElem('Error');
    if (loading) loading.style.display = 'block';
    if (error) error.style.display = 'none';

    pdfjsLib.getDocument(url).promise.then(function (doc) {
      pdfDoc     = doc;
      totalPages = doc.numPages;
      scale      = 1.0;

      // 初始缩放为适应宽度
      fitWidth();

      if (loading) loading.style.display = 'none';
    }).catch(function () {
      if (loading) loading.style.display = 'none';
      if (error) error.style.display = 'block';
    });
  }

  /**
   * 放大：增加 25%
   */
  function zoomIn() {
    if (!pdfDoc) return;
    var newScale = Math.min(scale + ZOOM_STEP, ZOOM_MAX);
    if (newScale === scale) return;
    scale = newScale;
    renderPage(currentPage);
  }

  /**
   * 缩小：减少 25%
   */
  function zoomOut() {
    if (!pdfDoc) return;
    var newScale = Math.max(scale - ZOOM_STEP, ZOOM_MIN);
    if (newScale === scale) return;
    scale = newScale;
    renderPage(currentPage);
  }

  /**
   * 适应容器宽度：自动计算缩放比例使页面宽度充满容器
   */
  function fitWidth() {
    if (!pdfDoc) return;

    var container = document.getElementById(containerId);
    if (!container) return;

    pdfDoc.getPage(currentPage).then(function (page) {
      var viewport    = page.getViewport({ scale: 1.0 });
      var containerW  = container.clientWidth;
      var fitScale    = containerW / viewport.width;
      scale = Math.max(fitScale, ZOOM_MIN);
      renderPage(currentPage);
    });
  }

  /**
   * 上一页
   */
  function prevPage() {
    if (!pdfDoc) return;
    if (currentPage <= 1) return;
    currentPage--;
    renderPage(currentPage);
  }

  /**
   * 下一页
   */
  function nextPage() {
    if (!pdfDoc) return;
    if (currentPage >= totalPages) return;
    currentPage++;
    renderPage(currentPage);
  }

  /**
   * 下载当前 PDF
   * 通过创建临时 a 标签触发浏览器下载
   */
  function downloadPDF() {
    if (!currentPdfUrl) return;
    var link     = document.createElement('a');
    link.href     = currentPdfUrl;
    link.download = currentPdfUrl.split('/').pop() || 'document.pdf';
    link.target    = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /* ---------- 导出公共接口 ---------- */
  return {
    init: init,
    loadPDF: loadPDF,
    renderPage: renderPage,
    zoomIn: zoomIn,
    zoomOut: zoomOut,
    fitWidth: fitWidth,
    prevPage: prevPage,
    nextPage: nextPage,
    downloadPDF: downloadPDF
  };

})();
