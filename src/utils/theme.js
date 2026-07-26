const KEY = "web.theme";

export function getTheme() {
    return localStorage.getItem(KEY) === "dark" ? "dark" : "light";
}

export function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
}

export function initTheme() {
    applyTheme(getTheme());
}

export function toggleTheme() {
    const next = getTheme() === "dark" ? "light" : "dark";
    localStorage.setItem(KEY, next);
    applyTheme(next);
    return next;
}
