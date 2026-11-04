// =============================================================================
// SHARED APP NAVIGATION (sidebar on desktop, slide-in drawer on mobile)
// Mount point: a `<div id="app-nav"></div>` placed as the first thing in <body>.
// Content wrapper needs `id="appContent"` + `lg:pl-64` so it isn't hidden
// under the fixed sidebar, and so it can be resized when the sidebar is
// pinned/collapsed. The collapsed state persists across pages via localStorage.
// =============================================================================

import { getCurrentUser, signOutUser } from './supabase.js';

const NAV_ITEMS = [
    { href: 'index.html', label: 'Trang Chủ', icon: 'fa-house' },
    { href: 'feed.html', label: 'Feed', icon: 'fa-bars-staggered' },
    { href: 'add-spot.html', label: 'Thêm Quán', icon: 'fa-plus' },
    { href: 'profile.html', label: 'Trang Cá Nhân', icon: 'fa-user' },
];

const COLLAPSE_KEY = 'chualangeats-nav-collapsed';

function currentPage() {
    const path = window.location.pathname.split('/').pop();
    return path === '' ? 'index.html' : path;
}

function getStoredCollapsed() {
    try {
        return localStorage.getItem(COLLAPSE_KEY) === '1';
    } catch {
        return false;
    }
}

function setStoredCollapsed(collapsed) {
    try {
        localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0');
    } catch {
        /* storage unavailable (private mode, etc.) — collapse just won't persist */
    }
}

// Pin/collapse only applies at the lg+ breakpoint — on mobile the drawer is
// always shown fully open, so every rule here lives inside that media query.
// #appSidebar / #appContent are id selectors, so they safely win over the
// plain `lg:w-64` / `lg:pl-64` Tailwind utility classes already on those
// elements without needing to touch those classes at all.
function injectCollapseStyles() {
    if (document.getElementById('nav-collapse-style')) return;
    const style = document.createElement('style');
    style.id = 'nav-collapse-style';
    style.textContent = `
        @media (min-width: 1024px) {
            #appSidebar, #appContent { transition: width 0.2s ease, padding-left 0.2s ease; }
            body.nav-collapsed #appSidebar { width: 5rem; }
            body.nav-collapsed #appContent { padding-left: 5rem; }
            body.nav-collapsed #appSidebar .nav-label { display: none; }
            body.nav-collapsed #appSidebar .nav-link { justify-content: center; }
            body.nav-collapsed #navAuthArea > a, body.nav-collapsed #navAuthArea > button { justify-content: center; }
            body.nav-collapsed #navCollapseIcon { transform: rotate(180deg); }
        }
    `;
    document.head.appendChild(style);
}

function applyCollapsed(collapsed) {
    document.body.classList.toggle('nav-collapsed', collapsed);
    const btn = document.getElementById('navCollapseBtn');
    btn?.setAttribute('aria-pressed', String(collapsed));
    btn?.setAttribute('title', collapsed ? 'Mở rộng menu' : 'Thu gọn menu');
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str ?? '';
    return div.innerHTML;
}

function navLinksHtml(active) {
    return NAV_ITEMS.map((item) => {
        const isActive = item.href === active;
        const cls = isActive
            ? 'bg-palette-ember/10 text-palette-ember'
            : 'text-palette-matcha/70 hover:bg-palette-tofu hover:text-palette-matcha';
        return `
            <a href="${item.href}" title="${item.label}" class="nav-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${cls}">
                <i class="fa-solid ${item.icon} w-4 text-center shrink-0 ${isActive ? 'text-palette-ember' : 'text-palette-matcha/40'}"></i>
                <span class="nav-label">${item.label}</span>
            </a>`;
    }).join('');
}

function sidebarHtml(active) {
    return `
        <!-- Mobile top bar -->
        <div class="lg:hidden sticky top-0 z-40 bg-white border-b border-palette-cream h-14 flex items-center justify-between px-4">
            <a href="index.html" class="flex items-center gap-2 font-bold text-base">
                <span class="w-7 h-7 rounded-lg bg-palette-ember flex items-center justify-center p-1"><img src="assets/logo-mark.png" alt="ChùaLángEats" class="w-full h-full object-contain"></span>
                <span>ChùaLáng<span class="text-palette-ember">Eats</span></span>
            </a>
            <button id="navToggleBtn" type="button" aria-label="Mở menu" class="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-palette-tofu text-palette-matcha">
                <i class="fa-solid fa-bars text-lg"></i>
            </button>
        </div>

        <!-- Mobile overlay -->
        <div id="navOverlay" class="hidden fixed inset-0 bg-black/40 z-40 lg:hidden"></div>

        <!-- Sidebar / drawer -->
        <aside id="appSidebar" class="fixed top-0 left-0 h-full w-64 bg-white border-r border-palette-cream z-50 flex flex-col -translate-x-full transition-transform duration-200 ease-out lg:translate-x-0">
            <div class="h-16 flex items-center gap-2 px-5 border-b border-palette-cream shrink-0">
                <span class="w-9 h-9 rounded-xl bg-gradient-to-tr from-palette-ember to-palette-yolk flex items-center justify-center p-1.5">
                    <img src="assets/logo-mark.png" alt="ChùaLángEats" class="w-full h-full object-contain">
                </span>
                <span class="nav-label font-bold text-base leading-tight">ChùaLáng<span class="text-palette-ember">Eats</span></span>
                <button id="navCloseBtn" type="button" aria-label="Đóng menu" class="ml-auto lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-palette-tofu text-palette-matcha/60">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <nav id="navLinksList" class="flex-grow overflow-y-auto py-4 px-3 space-y-1">
                ${navLinksHtml(active)}
            </nav>

            <!-- Pin / collapse toggle — desktop only, mobile closes via the X above -->
            <button id="navCollapseBtn" type="button" title="Thu gọn menu" class="hidden lg:flex items-center gap-3 px-3 py-3 mx-3 mb-1 rounded-xl text-sm font-semibold text-palette-matcha/60 hover:bg-palette-tofu hover:text-palette-matcha transition shrink-0">
                <i id="navCollapseIcon" class="fa-solid fa-angles-left w-4 text-center shrink-0 transition-transform"></i>
                <span class="nav-label">Thu Gọn</span>
            </button>

            <div id="navAuthArea" class="border-t border-palette-cream p-3 shrink-0">
                <div class="h-10 bg-palette-tofu/70 rounded-xl animate-pulse"></div>
            </div>
        </aside>`;
}

function renderAuth(user, profile) {
    const authArea = document.getElementById('navAuthArea');
    if (!authArea) return;

    if (user) {
        const name = profile?.username || user?.user_metadata?.username || 'Thành viên';
        const badge = profile?.badge || user?.user_metadata?.badge || 'Sinh Viên Verified';
        const initial = name.charAt(0).toUpperCase();

        authArea.innerHTML = `
            <a href="profile.html" title="${escapeHtml(name)}" class="flex items-center gap-2.5 mb-2 px-1 hover:opacity-80 transition">
                <span class="w-8 h-8 shrink-0 rounded-full bg-palette-ember text-white flex items-center justify-center text-xs font-bold">${escapeHtml(initial)}</span>
                <span class="nav-label min-w-0">
                    <span class="block text-xs font-bold truncate">${escapeHtml(name)}</span>
                    <span class="block text-[10px] text-palette-matcha/50 truncate">${escapeHtml(badge)}</span>
                </span>
            </a>
            <button id="navLogoutBtn" type="button" title="Đăng Xuất" class="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-palette-ember border border-palette-ember/25 rounded-xl py-2 hover:bg-palette-ember/5 transition">
                <i class="fa-solid fa-right-from-bracket shrink-0"></i> <span class="nav-label">Đăng Xuất</span>
            </button>`;

        document.getElementById('navLogoutBtn')?.addEventListener('click', async (e) => {
            const btn = e.currentTarget;
            btn.disabled = true;
            await signOutUser();
        });
    } else {
        authArea.innerHTML = `
            <a href="login.html" title="Đăng Nhập" class="flex items-center justify-center gap-1.5 w-full bg-palette-ember hover:bg-palette-ember/90 text-white text-xs font-bold py-2.5 rounded-xl shadow-sm transition">
                <i class="fa-solid fa-right-to-bracket shrink-0"></i> <span class="nav-label">Đăng Nhập</span>
            </a>`;
    }
}

function wireInteractions() {
    const sidebar = document.getElementById('appSidebar');
    const overlay = document.getElementById('navOverlay');
    const toggleBtn = document.getElementById('navToggleBtn');
    const closeBtn = document.getElementById('navCloseBtn');

    function openDrawer() {
        sidebar?.classList.remove('-translate-x-full');
        overlay?.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
    function closeDrawer() {
        sidebar?.classList.add('-translate-x-full');
        overlay?.classList.add('hidden');
        document.body.style.overflow = '';
    }

    toggleBtn?.addEventListener('click', openDrawer);
    closeBtn?.addEventListener('click', closeDrawer);
    overlay?.addEventListener('click', closeDrawer);
    document.querySelectorAll('#appSidebar .nav-link').forEach((link) => {
        link.addEventListener('click', closeDrawer);
    });
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeDrawer();
    });

    document.getElementById('navCollapseBtn')?.addEventListener('click', () => {
        const next = !document.body.classList.contains('nav-collapsed');
        applyCollapsed(next);
        setStoredCollapsed(next);
    });
}

async function init() {
    const mount = document.getElementById('app-nav');
    if (!mount) return;

    injectCollapseStyles();
    mount.innerHTML = sidebarHtml(currentPage());
    wireInteractions();
    applyCollapsed(getStoredCollapsed());

    try {
        const { user, profile } = await getCurrentUser();
        renderAuth(user, profile);
        if (profile?.role === 'admin' && !profile?.is_banned) {
            const active = currentPage();
            const isActive = active === 'admin.html';
            const cls = isActive
                ? 'bg-palette-ember/10 text-palette-ember'
                : 'text-palette-matcha/70 hover:bg-palette-tofu hover:text-palette-matcha';
            document.getElementById('navLinksList')?.insertAdjacentHTML('beforeend', `
                <a href="admin.html" title="Quản Trị" class="nav-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${cls}">
                    <i class="fa-solid fa-shield-halved w-4 text-center shrink-0 ${isActive ? 'text-palette-ember' : 'text-palette-matcha/40'}"></i>
                    <span class="nav-label">Quản Trị</span>
                </a>`);
        }
    } catch (err) {
        console.error('Nav auth check error:', err);
        renderAuth(null, null);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
