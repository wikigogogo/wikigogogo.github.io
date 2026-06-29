/**
 * project-detail.js — 项目详情页逻辑
 * 负责读取 URL 参数、填充项目信息、初始化 PDF 查看器、视频播放器、图片画廊
 */

(function () {
  'use strict';

  /* ---------- 常量 ---------- */

  /**
   * 分类 → 显示文字与样式 映射
   */
  var CATEGORY_MAP = {
    mechanical: { label: '机械结构', className: 'mechanical' },
    algorithm:  { label: '算法',     className: 'algorithm' },
    both:       { label: '机械结构 + 算法', className: 'both' }
  };

  /**
   * 当前项目的素材基础路径模板
   */
  function getProjectBasePath(projectId) {
    return 'projects/' + projectId + '/';
  }

  /* ========== URL 参数解析 ========== */

  /**
   * 从 URL 中获取项目 id 参数
   * 支持 ?id=xxx 格式
   */
  function getProjectIdFromURL() {
    var params = new URLSearchParams(window.location.search);
    return params.get('id');
  }

  /* ========== 错误处理 ========== */

  /**
   * 显示项目未找到的错误信息，并在 3 秒后跳转回首页
   */
  function showProjectNotFound() {
    var header = document.getElementById('projectHeader');
    if (header) {
      header.innerHTML =
        '<div class="error-message">' +
        '<h1>项目未找到</h1>' +
        '<p>无法找到对应的项目，请检查链接是否正确。</p>' +
        '<a href="index.html" class="back-link">返回项目列表</a>' +
        '</div>';
    }

    // 隐藏所有素材区域
    hideAllSections();

    // 3 秒后自动跳转回首页
    setTimeout(function () {
      window.location.href = 'index.html';
    }, 3000);
  }

  /**
   * 隐藏所有素材区域
   */
  function hideAllSections() {
    var sections = ['pdfSection', 'videoSection', 'imageSection', 'relatedSection'];
    sections.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
  }

  /* ========== 项目头部信息填充 ========== */

  /**
   * 填充项目头部区域：标题、描述、分类标签
   */
  function populateProjectHeader(project) {
    var header = document.getElementById('projectHeader');
    if (!header) return;

    // 分类标签
    var categoryEl = header.querySelector('.card-category');
    if (categoryEl) {
      var catInfo = CATEGORY_MAP[project.category] || { label: project.category, className: '' };
      categoryEl.textContent = catInfo.label;
      categoryEl.className = 'card-category ' + catInfo.className;
    }

    // 项目标题
    var titleEl = header.querySelector('.project-title');
    if (titleEl) titleEl.textContent = project.title;

    // 项目描述
    var descEl = header.querySelector('.description');
    if (descEl) descEl.textContent = project.description;

    // 更新页面标题
    document.title = project.title + ' — 个人项目展示';
  }

  /* ========== PDF 区域 ========== */

  /**
   * 初始化 PDF 区域：使用 iframe 嵌入 PDF，渲染标签页切换
   */
  function initPDFSection(project) {
    var pdfs = (project.assets && project.assets.pdfs) ? project.assets.pdfs : [];
    if (pdfs.length === 0) return;

    var section = document.getElementById('pdfSection');
    if (!section) return;
    section.style.display = 'block';

    var basePath = getProjectBasePath(project.id);
    var tabs = document.getElementById('pdfTabs');
    if (!tabs) return;

    // 清空标签
    tabs.innerHTML = '';

    var pdfFrame = document.getElementById('pdfFrame');

    // 渲染 PDF 标签按钮
    pdfs.forEach(function (pdf, index) {
      var tab = document.createElement('button');
      tab.className = 'pdf-tab' + (index === 0 ? ' active' : '');
      tab.textContent = pdf.label;
      tab.setAttribute('data-index', index);

      tab.addEventListener('click', function () {
        // 切换 active 状态
        var allTabs = tabs.querySelectorAll('.pdf-tab');
        allTabs.forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');

        // 加载对应的 PDF 到 iframe
        if (pdfFrame) {
          pdfFrame.src = basePath + pdf.file;
        }
      });

      tabs.appendChild(tab);
    });

    // 加载第一个 PDF
    if (pdfFrame) {
      pdfFrame.src = basePath + pdfs[0].file;
    }

    // 全屏按钮
    var fullscreenBtn = document.getElementById('pdfFullscreen');
    if (fullscreenBtn && pdfFrame) {
      fullscreenBtn.addEventListener('click', function () {
        if (pdfFrame.classList.contains('fullscreen')) {
          pdfFrame.classList.remove('fullscreen');
          fullscreenBtn.innerHTML = '&#x26F6; 全屏';
        } else {
          pdfFrame.classList.add('fullscreen');
          fullscreenBtn.innerHTML = '&#x2715; 退出全屏';
        }
      });

      // ESC 键退出全屏
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && pdfFrame.classList.contains('fullscreen')) {
          pdfFrame.classList.remove('fullscreen');
          fullscreenBtn.innerHTML = '&#x26F6; 全屏';
        }
      });
    }
  }

  /* ========== 视频区域 ========== */

  /**
   * 初始化视频区域：创建 video 标签
   */
  function initVideoSection(project) {
    var videos = (project.assets && project.assets.videos) ? project.assets.videos : [];
    if (videos.length === 0) return;

    var section = document.getElementById('videoSection');
    if (!section) return;
    section.style.display = 'block';

    var container = document.getElementById('videoContainer');
    if (!container) return;

    var basePath = getProjectBasePath(project.id);

    // 为每个视频创建 video 标签
    videos.forEach(function (video) {
      var wrapper = document.createElement('div');
      wrapper.className = 'video-item';

      if (video.label) {
        var label = document.createElement('p');
        label.className = 'video-label';
        label.textContent = video.label;
        wrapper.appendChild(label);
      }

      var videoEl = document.createElement('video');
      videoEl.controls = true;
      videoEl.preload = 'metadata';
      videoEl.className = 'project-video';

      // 设置 poster（如果有的话）
      if (video.poster) {
        videoEl.poster = basePath + video.poster;
      }

      // 创建 source 标签（支持 MP4）
      var source = document.createElement('source');
      source.src = basePath + video.file;
      source.type = 'video/mp4';
      videoEl.appendChild(source);

      wrapper.appendChild(videoEl);
      container.appendChild(wrapper);
    });
  }

  /* ========== 图片区域 ========== */

  /**
   * 初始化图片画廊区域
   */
  function initImageSection(project) {
    var images = (project.assets && project.assets.images) ? project.assets.images : [];
    if (images.length === 0) return;

    var section = document.getElementById('imageSection');
    if (!section) return;
    section.style.display = 'block';

    var basePath = getProjectBasePath(project.id);

    // 初始化 Gallery 组件
    Gallery.init('galleryGrid', 'lightbox');

    // 加载图片
    Gallery.loadImages(images, basePath);
  }

  /* ========== 相关项目 ========== */

  /**
   * 渲染相关项目：同类项目优先（相同 category），排除当前项目
   */
  function renderRelatedProjects(project) {
    var section = document.getElementById('relatedSection');
    var grid    = document.getElementById('relatedGrid');
    if (!section || !grid) return;

    // 筛选相关项目：同类优先，排除当前项目
    var sameCategory  = [];
    var otherCategory = [];

    PROJECTS.forEach(function (p) {
      // 排除当前项目
      if (p.id === project.id) return;

      // 如果分类相同
      if (p.category === project.category) {
        sameCategory.push(p);
      } else {
        otherCategory.push(p);
      }
    });

    // 合并，同类项目优先
    var related = sameCategory.concat(otherCategory);

    if (related.length === 0) {
      section.style.display = 'none';
      return;
    }

    section.style.display = 'block';

    // 清空网格
    grid.innerHTML = '';

    // 渲染相关项目卡片
    related.forEach(function (p) {
      var card = document.createElement('a');
      card.className = 'related-card';
      card.href = 'project.html?id=' + encodeURIComponent(p.id);

      // 缩略图
      var thumb = document.createElement('div');
      thumb.className = 'related-card-thumb';
      if (p.assets && p.assets.images && p.assets.images.length > 0) {
        var img = document.createElement('img');
        img.src = getProjectBasePath(p.id) + p.assets.images[0].file;
        img.alt = p.title;
        img.loading = 'lazy';
        thumb.appendChild(img);
      } else {
        var placeholder = document.createElement('div');
        placeholder.className = 'thumb-placeholder';
        placeholder.textContent = '\uD83D\uDCE6';
        thumb.appendChild(placeholder);
      }

      // 信息区
      var info = document.createElement('div');
      info.className = 'related-card-info';

      var catInfo = CATEGORY_MAP[p.category] || { label: p.category, className: '' };

      var cat = document.createElement('span');
      cat.className = 'card-category ' + catInfo.className;
      cat.textContent = catInfo.label;

      var title = document.createElement('h3');
      title.className = 'related-card-title';
      title.textContent = p.title;

      var summary = document.createElement('p');
      summary.className = 'related-card-summary';
      summary.textContent = p.summary;

      info.appendChild(cat);
      info.appendChild(title);
      info.appendChild(summary);

      card.appendChild(thumb);
      card.appendChild(info);

      grid.appendChild(card);
    });
  }

  /* ========== 初始化 ========== */

  /**
   * 项目详情页初始化入口
   */
  function initProjectDetail() {
    // 从 URL 获取项目 id
    var projectId = getProjectIdFromURL();
    if (!projectId) {
      showProjectNotFound();
      return;
    }

    // 在 PROJECTS 数组中查找对应项目
    var project = null;
    for (var i = 0; i < PROJECTS.length; i++) {
      if (PROJECTS[i].id === projectId) {
        project = PROJECTS[i];
        break;
      }
    }

    if (!project) {
      showProjectNotFound();
      return;
    }

    // 填充项目头部
    populateProjectHeader(project);

    // 初始化各素材区域（每个独立执行，互不阻塞）
    try { initPDFSection(project); } catch (e) { console.warn('PDF 区域初始化失败:', e); }
    try { initVideoSection(project); } catch (e) { console.warn('视频区域初始化失败:', e); }
    try { initImageSection(project); } catch (e) { console.warn('图片区域初始化失败:', e); }

    // 渲染相关项目
    try { renderRelatedProjects(project); } catch (e) { console.warn('相关项目渲染失败:', e); }
  }

  // DOM 就绪后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProjectDetail);
  } else {
    initProjectDetail();
  }

})();