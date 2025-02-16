let ready = (callback) => {
    if (document.readyState !== "loading") callback();
    else document.addEventListener("DOMContentLoaded", callback);
}

ready(() => {
    let darkMode = setTheme();

    document.getElementById("sigswitch-logo-black").style["display"] = darkMode ? "none" : "inline";
    document.getElementById("sigswitch-logo-white").style["display"] = darkMode ? "inline" : "none";
});
