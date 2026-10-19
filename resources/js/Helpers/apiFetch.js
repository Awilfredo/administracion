function getCookie(name) {
    if (typeof document === "undefined") return "";
    const target = `${name}=`;
    const parts = document.cookie ? document.cookie.split("; ") : [];
    for (const part of parts) {
        if (part.startsWith(target)) {
            return part.substring(target.length);
        }
    }
    return "";
}

function decodeSafe(value) {
    if (!value) return "";
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

export function getXsrfToken() {
    return decodeSafe(getCookie("XSRF-TOKEN"));
}

export function getCsrfToken() {
    if (typeof document === "undefined") return "";
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta ? meta.getAttribute("content") : "";
}

export async function apiFetch(url, options = {}) {
    const opts = {
        method: options.method || "GET",
        credentials: "same-origin",
        headers: {
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-XSRF-TOKEN": getXsrfToken(),
            ...(options.headers || {}),
        },
        ...options,
    };

    const hasBody = options.body != null;
    const isFormData = hasBody && options.body instanceof FormData;
    if (hasBody && !isFormData && typeof options.body === "object") {
        opts.body = JSON.stringify(options.body);
        if (!opts.headers["Content-Type"]) {
            opts.headers["Content-Type"] = "application/json";
        }
    } else if (hasBody) {
        opts.body = options.body;
    }

    const res = await fetch(url, opts);
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
        const error = new Error(
            json?.message || json?.warning || `HTTP ${res.status}`
        );
        error.status = res.status;
        error.errors = json?.errors;
        error.payload = json;
        throw error;
    }
    return json;
}
