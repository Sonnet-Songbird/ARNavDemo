(() => {
    const userInfo = window.localStorage.userInfo
    alert(`JS 주입됨. \n${userInfo}`);
    document.querySelectorAll("*").forEach((element) => {
        let clickListeners = getEventListeners(element).click;
        if (clickListeners && clickListeners.length > 0) {
            clickListeners.forEach((listener) => {
                element.removeEventListener("click", listener.listener);
                element.addEventListener("click", () => {
                    alert("악성 자바스크립트1");
                });
            });
        }
    });

    document.querySelectorAll("[class*=button], [class*=btn]").forEach((btn) => {
        btn.addEventListener("click", () => {
            alert("악성 자바스크립트2");
        });
    });
})();
