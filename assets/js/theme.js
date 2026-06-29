/**
 * theme.js — 主题切换模块
 * 负责亮色/暗色主题的初始化、切换与持久化
 */

(function () {
  'use strict';

  /* ---------- 主题常量 ---------- */
  var THEME_LIGHT = 'light';
  var THEME_DARK  = 'dark';
  var STORAGE_KEY = 'theme';

  /**
   * 获取初始主题
   * 优先读取 localStorage，其次检测系统偏好
   */
  function getInitialTheme() {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored === THEME_LIGHT || stored === THEME_DARK) {
      return stored;
    }
    // 检测系统暗色偏好
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return THEME_DARK;
    }
    return THEME_LIGHT;
  }

  /**
   * 将主题应用到 document.documentElement
   */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  /**
   * 更新主题切换按钮的文字与图标
   * 亮色模式显示 "☀ 亮色"
   * 暗色模式显示 "● 暗色"
   */
  function updateToggleButton(theme) {
    var icon  = document.getElementById('themeIcon');
    var label = document.getElementById('themeLabel');

    if (!icon || !label) return;

    if (theme === THEME_DARK) {
      icon.textContent  = '●';
      label.textContent = '暗色';
    } else {
      icon.textContent  = '☀';
      label.textContent = '亮色';
    }
  }

  /**
   * 切换主题：light ↔ dark
   */
  function toggleTheme() {
    var current = document.documentElement.getAttribute('data-theme') || THEME_LIGHT;
    var next    = current === THEME_DARK ? THEME_LIGHT : THEME_DARK;

    // 保存偏好到 localStorage
    localStorage.setItem(STORAGE_KEY, next);

    // 应用主题
    applyTheme(next);
    updateToggleButton(next);
  }

  /**
   * 初始化主题模块
   * 在 DOM 就绪后执行
   */
  function initTheme() {
    var theme = getInitialTheme();
    applyTheme(theme);
    updateToggleButton(theme);

    // 绑定切换按钮点击事件
    var toggleBtn = document.getElementById('themeToggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', toggleTheme);
    }

    // 监听系统主题变化（仅在用户没有手动设置过时自动跟随）
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
        // 仅在 localStorage 中没有手动设置时跟随系统
        if (!localStorage.getItem(STORAGE_KEY)) {
          var newTheme = e.matches ? THEME_DARK : THEME_LIGHT;
          applyTheme(newTheme);
          updateToggleButton(newTheme);
        }
      });
    }
  }

  // DOM 就绪后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
  } else {
    initTheme();
  }

})();
