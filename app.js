(function () {
  const container = document.getElementById('projectsContainer');
  const completedContainer = document.getElementById('completedContainer');
  const activeContainer = document.getElementById('activeContainer');
  const activeCountEl = document.getElementById('activeCount');
  const completedCountEl = document.getElementById('completedCount');
  const platformCountEl = document.getElementById('platformCount');
  const modalOverlay = document.getElementById('modalOverlay');
  const modalTitle = document.getElementById('modalTitle');
  const modalPlatform = document.getElementById('modalPlatform');
  const modalBody = document.getElementById('modalBody');
  const modalClose = document.getElementById('modalClose');
  const platformButtonsRow = document.getElementById('platformButtons');
  const langButtonsRow = document.getElementById('langButtons'); // NEW
  const modalWindow = document.querySelector('.modal-window');
  const logoButton = document.getElementById('logoButton');

  let activePlatformFilter = 'all';
  let activeLangFilter = 'all';
  let logoProject = null;

  function linkify(text) {
    if (!text) return '';
    return text.replace(
      /(https?:\/\/[^\s<]+)/g,
      `<a
        href="$1"
        target="_blank"
        rel="noopener noreferrer"
        class="bio-link"
      >link</a>`
    );
  }
  function formatBio(text) {
    return linkify(text);
  }

  function getPlatforms(p) {
    if (!p || !p.platform) return [];
    return Array.isArray(p.platform) ? p.platform : [p.platform];
  }

  function lockScroll() {
    document.body.classList.add('modal-open');
  }

  function unlockScroll() {
    document.body.classList.remove('modal-open');
  }

  function cleanup() {
    modalOverlay.classList.remove('show', 'small-popup');
    unlockScroll();
    modalBody.innerHTML = '';
    if (modalOverlay.hasAttribute('dir')) modalOverlay.removeAttribute('dir');
    if (modalOverlay.hasAttribute('lang')) modalOverlay.removeAttribute('lang');
    if (modalWindow && modalWindow.hasAttribute('dir')) modalWindow.removeAttribute('dir');
    if (modalWindow && modalWindow.hasAttribute('lang')) modalWindow.removeAttribute('lang');
  }

  function closeModal() {
    if (modalWindow && modalWindow.animate) {
      const anim = modalWindow.animate(
        [
          { opacity: 1, transform: 'scale(1)' },
          { opacity: 0, transform: 'scale(0.9)' }
        ],
        { duration: 150, easing: 'ease-in' }
      );
      anim.onfinish = cleanup;
    } else {
      cleanup();
    }
  }

  function updateLangButtonsActiveState() {
    if (!langButtonsRow) return;
    const buttons = langButtonsRow.querySelectorAll('.lang-btn');
    buttons.forEach(btn => {
      const code = btn.dataset.lang;
      const isActive = activeLangFilter === code;
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      btn.classList.toggle('lang-btn-active', isActive);
    });
  }

  function setupLangButtons() {
    if (!langButtonsRow) return;
    langButtonsRow.innerHTML = '';

    const makeLangButton = (label, code) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'lang-btn';
      b.textContent = label;
      b.dataset.lang = code;
      b.setAttribute('aria-pressed', 'false');

      b.onclick = () => {
        if (activeLangFilter === code) {
          activeLangFilter = 'all';
        } else {
          activeLangFilter = code;
        }
        updateLangButtonsActiveState();
        render();
      };

      return b;
    };

    langButtonsRow.appendChild(makeLangButton('EN', 'en'));
    langButtonsRow.appendChild(makeLangButton('AR', 'ar'));

    updateLangButtonsActiveState();
  }

  function setupPlatformButtons(projects) {
    if (!platformButtonsRow) return;
    platformButtonsRow.innerHTML = '';
    const platforms = [...new Set(projects.flatMap(getPlatforms))];

    const makeButton = (label, plat) => {
      const b = document.createElement('button');
      b.className = 'circle-btn';
      b.textContent = label;
      b.type = 'button';
      b.setAttribute('aria-pressed', activePlatformFilter === plat ? 'true' : 'false');
      b.onclick = () => {
        activePlatformFilter = plat;
        const buttons = platformButtonsRow.querySelectorAll('.circle-btn');
        buttons.forEach(btn => {
          btn.setAttribute(
            'aria-pressed',
            btn.textContent === label ? 'true' : 'false'
          );
        });
        render();
      };
      return b;
    };

    platformButtonsRow.appendChild(makeButton('All', 'all'));
    platforms.forEach(p => platformButtonsRow.appendChild(makeButton(p, p)));
  }

  function matchesFilters(p) {
    const platOK =
      activePlatformFilter === 'all' ||
      getPlatforms(p).includes(activePlatformFilter);

    const langCode = (p.lang ? String(p.lang).toLowerCase() : '');
    const langOK =
      activeLangFilter === 'all' ||
      langCode === activeLangFilter;

    return platOK && langOK;
  }

  function makeCard(p) {
    const card = document.createElement('article');
    card.className = 'project-card';

    if (p.image) {
      card.style.backgroundImage = `url('${p.image}')`;
      card.style.backgroundSize = 'cover';
      card.style.backgroundPosition = 'center';
    } else if (p.imgBase) {
      card.style.backgroundImage = `url('${p.imgBase}')`;
      card.style.backgroundSize = 'cover';
      card.style.backgroundPosition = 'center';
    }

    const head = document.createElement('div');
    head.className = 'project-head';

    const logoWrap = document.createElement('div');
    logoWrap.className = 'project-logo-wrap';

    const logoImg = document.createElement('img');
    logoImg.className = 'project-logo';
    logoImg.src = p.logo || p.image || p.imgBase || '';
    logoImg.alt = p.name || '';
    logoWrap.appendChild(logoImg);
    head.appendChild(logoWrap);

    if (p.ppimg1 || p.ppimg2 || p.ppimg3) {
      const charsWrap = document.createElement('div');
      charsWrap.className = 'project-characters';

      if (p.ppimg1) {
        const c1 = document.createElement('img');
        c1.className = 'character character-left';
        c1.src = p.ppimg1;
        c1.alt = (p.name || '') + ' character left';
        charsWrap.appendChild(c1);
      }

      if (p.ppimg2) {
        const c2 = document.createElement('img');
        c2.className = 'character character-front';
        c2.src = p.ppimg2;
        c2.alt = (p.name || '') + ' character front';
        charsWrap.appendChild(c2);
      }

      if (p.ppimg3) {
        const c3 = document.createElement('img');
        c3.className = 'character character-right';
        c3.src = p.ppimg3;
        c3.alt = (p.name || '') + ' character right';
        charsWrap.appendChild(c3);
      }

      head.appendChild(charsWrap);
    }

    card.appendChild(head);
    card.onclick = () => openProjectWindow(p, { full: p.status === 'complate' });
    return card;
  }

  function render() {
    container.innerHTML = '';
    completedContainer.innerHTML = '';
    activeContainer.innerHTML = '';

    const all = (typeof PROJECTS !== 'undefined' ? PROJECTS : []);

    const gridProjects = all.filter(p => p.slug !== 'phi-logo').filter(matchesFilters);

    gridProjects.forEach(p => {
      if (p.status === 'active') activeContainer.appendChild(makeCard(p));
      else if (p.status === 'complate') completedContainer.appendChild(makeCard(p));
      else container.appendChild(makeCard(p));
    });

    if (activeCountEl) {
      activeCountEl.textContent = all.filter(p => p.status === 'active').length;
    }
    if (completedCountEl) {
      completedCountEl.textContent = all.filter(p => p.status === 'complate').length;
    }
    if (platformCountEl) {
      platformCountEl.textContent = new Set(all.flatMap(getPlatforms)).size;
    }
  }

  function openProjectWindow(p, opts = { full: true }) {
    modalOverlay.classList.remove('small-popup');

    const langRaw = (p && p.lang) ? String(p.lang).toLowerCase() : '';
    const isRTL = langRaw === 'ar';
    const langAttr = isRTL ? 'ar' : 'en';

    modalOverlay.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    modalOverlay.setAttribute('lang', langAttr);
    if (modalWindow) {
      modalWindow.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
      modalWindow.setAttribute('lang', langAttr);
    }

    modalTitle.textContent = p.name || '';
    modalPlatform.textContent = getPlatforms(p).join(' · ');

    if (opts.full) {
      const vh = Math.round(window.innerHeight * 0.75);

      modalBody.innerHTML = `
        <iframe
          src="projects/${p.slug}/index.html"
          style="
            width:100%;
            height:${vh}px;
            border:0;
            border-radius:10px;
            background:#000;
          "
          loading="lazy"
          dir="${isRTL ? 'rtl' : 'ltr'}"
          lang="${langAttr}">
        </iframe>
      `;
    } else {
      const hasI18N = typeof I18N !== 'undefined';
      const labels = isRTL
        ? {
            project: 'المشروع',
            type: 'تصنيف المشروع',
            status: 'الحالة',
            count: 'التقدم',
            tags: 'نوع المشروع',
            bio: 'نبذة',
            types: { Port: '---', Translation: 'ترجمة' },
            statuses: { active: 'على قيد العمل', complate: 'مكتمل' },
            tagValues: { Translation: 'ترجمة' }
          }
        : {
            project: 'Project',
            type: 'Type',
            status: 'Status',
            count: 'Count',
            tags: 'Tags',
            bio: 'Bio',
            types: { Port: 'Port', Translation: 'Translation' },
            statuses: { active: 'Active', complate: 'Completed' },
            tagValues: { Translation: 'Translation' }
          };

      const statusText =
        (labels.statuses && labels.statuses[p.status]) ||
        (hasI18N && I18N.status?.[p.status]) ||
        p.status;

      const tagsHtml = (p.tags || [])
        .map(t => `<span class="tag-lang badge">${labels.tagValues?.[t] ?? t}</span>`)
        .join(' ');

      const bioHtml = p.bio
        ? `<p class="project-bio" style="margin-top:4px;">${formatBio(p.bio)}</p>`
        : '';

      const bioImageHtml = p.bioImage
        ? `
          <div class="project-bio-image" style="margin-top:14px;text-align:center;">
            <div
              style="
                display:inline-block;
                padding:10px;
                border-radius:18px;
                background:rgba(0,0,0,0.35);
                border:1px solid rgba(255,255,255,0.06);
                box-shadow:0 10px 26px rgba(0,0,0,0.65);
                max-width:260px;
                width:100%;
              "
            >
              <img
                src="${p.bioImage}"
                alt="${(p.name || '')} bio image"
                style="
                  width:100%;
                  max-height:220px;
                  object-fit:contain;
                  border-radius:12px;
                  display:block;
                  margin:0 auto;
                "
              />
            </div>
          </div>
        `
        : '';

      modalBody.innerHTML = `
        <div style="padding:8px 4px;" dir="${isRTL ? 'rtl' : 'ltr'}" lang="${langAttr}">
          <p><strong>${labels.project}:</strong> ${p.name || ''}</p>
          <p><strong>${labels.type}:</strong> ${labels.types?.[p.type] ?? p.type ?? '-'}</p>
          <p><strong>${labels.status}:</strong> ${statusText}</p>
          <p><strong>${labels.count}:</strong> ${p.count || 0}</p>
          <p><strong>${labels.tags}:</strong> ${tagsHtml || '<em>-</em>'}</p>
          ${bioHtml}
          ${bioImageHtml}
        </div>
      `;
      modalOverlay.classList.add('small-popup');
    }

    modalOverlay.classList.add('show');
    lockScroll();

    if (modalWindow && modalWindow.animate) {
      modalWindow.animate(
        [
          { opacity: 0, transform: 'scale(0.9)' },
          { opacity: 1, transform: 'scale(1)' }
        ],
        { duration: 200, easing: 'ease-out' }
      );
    }
  }

  function openLogoPopup() {
    if (!logoProject) return;

    modalOverlay.classList.add('small-popup');
    modalOverlay.setAttribute('dir', 'ltr');
    modalOverlay.setAttribute('lang', 'en');
    if (modalWindow) {
      modalWindow.setAttribute('dir', 'ltr');
      modalWindow.setAttribute('lang', 'en');
    }

    modalTitle.innerHTML = `
      <span class="lang-en" dir="ltr">About me</span>
      <span class="lang-ar" dir="rtl">عني انا</span>
    `;

    modalPlatform.textContent = '';

    const bioText = logoProject.bio || '';
    const bioImage = logoProject.bioImage || logoProject.logo || '';

    modalBody.innerHTML = `
      <div
        style="
          padding:16px 14px;
          border-radius:16px;
          background:linear-gradient(
            180deg,
            rgba(255,255,255,0.04),
            rgba(255,255,255,0.015)
          );
          border:1px solid rgba(255,255,255,0.06);
          box-shadow:0 12px 40px rgba(2,6,23,0.6);
        "
      >
        <!-- EN block -->
        <div
          style="
            padding:10px 12px;
            border-radius:12px;
            background:rgba(102,217,255,0.08);
            margin-bottom:10px;
          "
        >
          <p dir="ltr" lang="en" style="margin:0;">
            About me, PHI. I like to do stuff and working with other people, feel free to contact me.
          </p>
        </div>

        <!-- AR block -->
        <div
          style="
            padding:10px 12px;
            border-radius:12px;
            background:rgba(255,179,255,0.08);
            margin-bottom:12px;
          "
        >
          <p dir="rtl" lang="ar" style="margin:0;">
            انا (فاي) شخص يحب العمل على تعريبات او أدوات برمجية، اذا تحتاج شي او مهتم بشي تواصل معي.
          </p>
        </div>

        ${
          bioText
            ? `<p
                 style="
                   margin:12px 4px 0;
                   line-height:1.6;
                   opacity:0.9;
                 "
               >${formatBio(bioText)}</p>`
            : ''
        }

        <div style="margin-top:18px; text-align:center;">
          <div style=" display:inline-block; padding:14px; border-radius:999px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); box-shadow:0 10px 25px rgba(0,0,0,0.6);">
            <img src="${bioImage}" alt="Phi logo" style=" max-width:120px; height:auto; opacity:0.95; filter:drop-shadow(0 8px 18px rgba(0,0,0,0.65)); display:block;"/>
          </div>
        </div>
      </div>
    `;

    modalOverlay.classList.add('show');
    lockScroll();

    if (modalWindow && modalWindow.animate) {
      modalWindow.animate(
        [
          { opacity: 0, transform: 'scale(0.92)' },
          { opacity: 1, transform: 'scale(1)' }
        ],
        { duration: 200, easing: 'ease-out' }
      );
    }
  }

  modalClose.onclick = closeModal;
  modalOverlay.addEventListener('click', e => {
    if (e.target === modalOverlay) closeModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('show')) {
      closeModal();
    }
  });

  const allProjects =
    (typeof PROJECTS !== 'undefined' && Array.isArray(PROJECTS)) ? PROJECTS : [];
  logoProject = allProjects.find(p => p.slug === 'phi-logo') || null;

  if (logoButton && logoProject) {
    logoButton.src = logoProject.logo || logoProject.image || logoButton.src;
    logoButton.alt = logoProject.name || 'Phi logo';
    logoButton.setAttribute('aria-label', 'Open Phi window');

    logoButton.addEventListener('click', openLogoPopup);
    logoButton.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLogoPopup();
      }
    });
  }

  setupLangButtons();
  setupPlatformButtons(allProjects.filter(p => p.slug !== 'phi-logo'));
  render();
})();
