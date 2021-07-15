
export function logoutListener() {
    document.getElementById("logout").addEventListener("click", async event => {
        event.preventDefault();
        await sessionStorage.removeItem("userId");
        await sessionStorage.removeItem("token");
        document.location.href = "index.html";
    });
}

