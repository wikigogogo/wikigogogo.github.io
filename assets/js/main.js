/**
 * main.js — 首页主逻辑
 * 负责个人信息填充、项目卡片渲染、筛选功能、URL hash 联动
 */

(function () {
  'use strict';

  /* ---------- 常量与缓存 ---------- */
  var currentFilter = 'all';  // 当前筛选条件

  /**
   * 分类 → 显示文字 映射
   */
  var CATEGORY_LABELS = {
    mechanical: '机械结构',
    algorithm:  '算法',
    both:       '机械结构 + 算法'
  };

  /**
   * 分类 → 色标 class 映射
   */
  var CATEGORY_CLASSES = {
    mechanical: 'mechanical',
    algorithm:  'algorithm',
    both:       'both'
  };

  /* ========== 个人信息填充 ========== */

  /**
   * 将 PROFILE 对象中的信息填充到页面 header
   */
  function populateProfile() {
    setTextContent('profileName', PROFILE.name);
    setTextContent('profileTitle', PROFILE.title);
    setTextContent('profileBio', PROFILE.bio);

    // 填充联系方式
    var contactLinks = document.getElementById('contactLinks');
    if (contactLinks) {
      contactLinks.innerHTML = '';

      if (PROFILE.email) {
        contactLinks.appendChild(createContactLink('mailto:' + PROFILE.email, PROFILE.email));
      }
      if (PROFILE.phone) {
        contactLinks.appendChild(createContactLink('tel:' + PROFILE.phone, PROFILE.phone));
      }
      if (PROFILE.github) {
        contactLinks.appendChild(createContactLink(PROFILE.github, 'GitHub'));
      }
    }
  }

  /**
   * 创建联系方式链接元素
   */
  function createContactLink(href, text) {
    var a = document.createElement('a');
    a.href = href;
    a.textContent = text;
    a.className = 'contact-link';
    a.target = href.startsWith('http') ? '_blank' : '';
    return a;
  }

  /**
   * 安全设置元素文本内容
   */
  function setTextContent(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text || '';
  }

  /* ========== 筛选按钮计数 ========== */

  /**
   * 计算每个分类下的项目数量，更新筛选按钮上的 .count 徽标
   */
  function updateFilterCounts() {
    var counts = {
      all:        PROJECTS.length,
      mechanical: 0,
      algorithm:  0,
      both:       0
    };

    PROJECTS.forEach(function (project) {
      if (project.category === 'mechanical') counts.mechanical++;
      if (project.category === 'algorithm')  counts.algorithm++;
      if (project.category === 'both')       counts.both++;
    });

    // 更新 DOM
    updateCount('countAll',        counts.all);
    updateCount('countMechanical',  counts.mechanical);
    updateCount('countAlgorithm',   counts.algorithm);
    updateCount('countBoth',        counts.both);
  }

  /**
   * 更新单个计数元素
   */
  function updateCount(id, count) {
    var el = document.getElementById(id);
    if (el) el.textContent = ' (' + count + ')';
  }

  /* ========== 项目卡片渲染 ========== */

  /**
   * 根据筛选条件渲染项目网格
   * @param {string} filter - 筛选条件: 'all' | 'mechanical' | 'algorithm'
   */
  function renderProjectGrid(filter) {
    var grid = document.getElementById('projectGrid');
    var emptyState = document.getElementById('emptyState');
    if (!grid) return;

    // 根据筛选条件过滤项目
    var filtered = PROJECTS.filter(function (project) {
      switch (filter) {
        case 'all':
          return true;
        case 'mechanical':
          return project.category === 'mechanical' || project.category === 'both';
        case 'algorithm':
          return project.category === 'algorithm' || project.category === 'both';
        default:
          return true;
      }
    });

    // fade 过渡动画
    grid.style.opacity = '0';
    grid.style.transform = 'translateY(8px)';

    setTimeout(function () {
      // 清空网格
      grid.innerHTML = '';

      if (filtered.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
      } else {
        if (emptyState) emptyState.style.display = 'none';

        // 生成项目卡片
        filtered.forEach(function (project) {
          var card = createProjectCard(project);
          grid.appendChild(card);
        });
      }

      // 显示网格（带动画）
      grid.style.opacity = '1';
      grid.style.transform = 'translateY(0)';
    }, 200);
  }

  /**
   * 创建单个项目卡片 DOM 元素
   */
  function createProjectCard(project) {
    var card = document.createElement('a');
    card.className = 'project-card';
    card.href = 'project.html?id=' + encodeURIComponent(project.id);
    card.setAttribute('data-category', project.category);

    // 缩略图区域
    var thumb = document.createElement('div');
    thumb.className = 'card-thumb';
    if (project.assets && project.assets.images && project.assets.images.length > 0) {
      var firstImage = project.assets.images[0];
      var img = document.createElement('img');
      img.src = 'projects/' + project.id + '/' + firstImage.file;
      img.alt = firstImage.label || project.title;
      img.loading = 'lazy';
      thumb.appendChild(img);
    } else {
      // 无图片时显示占位符
      var placeholder = document.createElement('div');
      placeholder.className = 'thumb-placeholder';
      placeholder.textContent = '\uD83D\uDCE6';
      thumb.appendChild(placeholder);
    }

    // 卡片主体
    var body = document.createElement('div');
    body.className = 'card-body';

    // 分类标签（带色标）
    var categoryDiv = document.createElement('div');
    categoryDiv.className = 'card-category ' + (CATEGORY_CLASSES[project.category] || '');
    // 添加色标圆点
    var dot = document.createElement('span');
    dot.className = 'dot';
    if (project.category === 'both') {
      var dotGroup = document.createElement('span');
      dotGroup.className = 'dot-group';
      var dotM = document.createElement('span');
      dotM.className = 'dot-m';
      var dotA = document.createElement('span');
      dotA.className = 'dot-a';
      dotGroup.appendChild(dotM);
      dotGroup.appendChild(dotA);
      categoryDiv.appendChild(dotGroup);
    } else {
      categoryDiv.appendChild(dot);
    }
    var labelNode = document.createElement('span');
    labelNode.textContent = CATEGORY_LABELS[project.category] || project.category;
    categoryDiv.appendChild(labelNode);

    // 项目标题
    var title = document.createElement('h3');
    title.className = 'card-title';
    title.textContent = project.title;

    // 项目简介
    var summary = document.createElement('p');
    summary.className = 'card-summary';
    summary.textContent = project.summary;

    // 标签列表
    var tags = document.createElement('div');
    tags.className = 'card-tags';
    if (project.tags && project.tags.length > 0) {
      project.tags.forEach(function (tag) {
        var tagSpan = document.createElement('span');
        tagSpan.className = 'tag';
        tagSpan.textContent = tag;
        tags.appendChild(tagSpan);
      });
    }

    // 素材统计（PDF / 视频 / 图片 数量）
    var assetsDiv = document.createElement('div');
    assetsDiv.className = 'card-assets';
    var assetItems = [];
    if (project.assets) {
      if (project.assets.pdfs && project.assets.pdfs.length > 0) {
        assetItems.push('PDF ' + project.assets.pdfs.length);
      }
      if (project.assets.videos && project.assets.videos.length > 0) {
        assetItems.push('\uD83C\uDFAC ' + project.assets.videos.length);
      }
      if (project.assets.images && project.assets.images.length > 0) {
        assetItems.push('\uD83D\uDDBC\uFE0F ' + project.assets.images.length);
      }
    }
    assetsDiv.textContent = assetItems.join('  /  ');

    // 组装卡片
    body.appendChild(categoryDiv);
    body.appendChild(title);
    body.appendChild(summary);
    body.appendChild(tags);
    body.appendChild(assetsDiv);

    card.appendChild(thumb);
    card.appendChild(body);

    return card;
  }

  /* ========== 筛选交互 ========== */

  /**
   * 绑定筛选按钮点击事件
   */
  function initFilterButtons() {
    var nav = document.getElementById('filterNav');
    if (!nav) return;

    var buttons = nav.querySelectorAll('.filter-btn');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var filter = btn.getAttribute('data-filter');
        if (!filter) return;

        // 更新 active 状态
        buttons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');

        // 更新当前筛选
        currentFilter = filter;

        // 更新 URL hash（不触发页面跳转）
        history.replaceState(null, '', '#' + filter);

        // 渲染项目网格
        renderProjectGrid(filter);
      });
    });
  }

  /**
   * 从 URL hash 中读取初始筛选条件
   * 支持格式：#all, #mechanical, #algorithm
   */
  function getFilterFromHash() {
    var hash = window.location.hash.replace('#', '');
    if (hash === 'mechanical' || hash === 'algorithm') {
      return hash;
    }
    return 'all';
  }

  /**
   * 根据 filter 值设置对应的筛选按钮为 active 状态
   */
  function setActiveFilterButton(filter) {
    var nav = document.getElementById('filterNav');
    if (!nav) return;

    var buttons = nav.querySelectorAll('.filter-btn');
    buttons.forEach(function (btn) {
      btn.classList.remove('active');
      if (btn.getAttribute('data-filter') === filter) {
        btn.classList.add('active');
      }
    });
  }

  /* ========== 初始化 ========== */

  /**
   * 首页初始化
   */
  function initMain() {
    // 填充个人信息
    populateProfile();

    // 更新筛选按钮计数
    updateFilterCounts();

    // 初始化筛选按钮事件
    initFilterButtons();

    // 从 URL hash 获取初始筛选条件
    currentFilter = getFilterFromHash();
    setActiveFilterButton(currentFilter);

    // 渲染初始项目网格
    renderProjectGrid(currentFilter);

    // 监听 hash 变化（浏览器前进/后退）
    window.addEventListener('hashchange', function () {
      currentFilter = getFilterFromHash();
      setActiveFilterButton(currentFilter);
      renderProjectGrid(currentFilter);
    });
  }

  // DOM 就绪后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMain);
  } else {
    initMain();
  }

})();
