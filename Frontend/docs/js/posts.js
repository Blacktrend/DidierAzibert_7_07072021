
import {port} from "./port.js";
import {logoutListener} from "./logout.js";


async function getAllPosts(token) {
    try {
        const response = await fetch(`http://localhost:${port}/api/posts`,{
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        });
        return response.ok ? response.json() : alert("Erreur HTTP " + response.status);
    }
    catch(err) { alert(err); }
}


function displayPosts(posts) {

    const cardsContainer = document.getElementById("cards");

    for (let post of posts) {
        const card = document.createElement("div");
        card.classList.add("col-11", "col-sm-5", "col-lg-3", "card", "m-2", "py-3");
        const datetime = new Date(post.updatedAt);
        const date = datetime.toLocaleDateString('fr-FR');

        card.innerHTML = `<img src="${post.imageUrl}" class="card-img-top rounded" alt=""/>
    <div class="card-body d-flex flex-column justify-content-end position-relative">
        <h2 class="card-title fs-5 my-3">${post.title}</h2>
        <div class="date position-absolute bg-secondary text-white rounded px-2">${date}</div>
        <a href="post.html?postId=${post.id}&userId=${post.user_id}" class="btn btn-primary">LIRE</a>
    </div>`;
        cardsContainer.append(card);
    }
}


async function main() {
    if (sessionStorage.getItem("token")) {
        const token = sessionStorage.getItem("token");

        const posts = await getAllPosts(token);
        displayPosts(posts);


        // remove userId and token from sessionStorage and redirect to index page
        logoutListener();
    }
    else document.location.href = "index.html";
}

main();
