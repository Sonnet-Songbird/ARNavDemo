(() => {
    const userInfo = window.localStorage.userInfo;
    alert(`JS 주입됨. \n${userInfo}`);

    setTimeout(() => {
        document.querySelectorAll("[class*=button], [class*=btn]").forEach((btn) => {
            btn.addEventListener("click", () => {
                alert("악성 자바스크립트");
            });
        });
    }, 2000);
})();
