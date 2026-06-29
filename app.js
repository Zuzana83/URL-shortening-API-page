const menuToggleBtnEl = document.getElementById("menuToggleBtn");
const pageNavEl = document.querySelector(".page-navigation");
const navListEl = document.querySelector(".navigation-list");
const formEl = document.getElementById("shortenLinkForm");
const formInputEl = document.getElementById("addressInput");
const errMsgEl = document.querySelector(".error-msg");
const linksContainerEl = document.querySelector(".links-container");

let linksArray = [];

const openMenu = () => {
    pageNavEl.classList.add("open");
    menuToggleBtnEl.setAttribute("aria-expanded", "true");
    menuToggleBtnEl.setAttribute("aria-label", "Close menu");
}

const closeMenu = () => {
    pageNavEl.classList.remove("open");
    menuToggleBtnEl.setAttribute("aria-expanded", "false");
    menuToggleBtnEl.setAttribute("aria-label", "Open menu");
}

if(menuToggleBtnEl && pageNavEl) {
    menuToggleBtnEl.addEventListener("click", function() {
        const isOpen = pageNavEl.classList.contains("open");
        isOpen ? closeMenu() : openMenu();
    });
}

if(pageNavEl && menuToggleBtnEl) {
    pageNavEl.addEventListener("click", function(e) {
        if(e.target.classList.contains("nav-link") || e.target.classList.contains("account-btn")) {
            closeMenu();
        };
    });
}

window.addEventListener("click", function(e) {
    if(!pageNavEl.classList.contains("open")) return;
    const isInsideNav = pageNavEl.contains(e.target) || menuToggleBtnEl.contains(e.target);
    if(!isInsideNav) closeMenu();
})

const displayNewLink = (originalURL, shortURL) => {
    const li = document.createElement("li");
    li.className = "link-item";
    const p = document.createElement("p");
    p.className = "original-link";
    p.textContent = originalURL;
    li.appendChild(p);
    const div = document.createElement("div");
    div.className = "shorter-version";
    const pShort = document.createElement("p");
    pShort.textContent = shortURL;
    const button = document.createElement("button");
    button.textContent = "Copy";
    button.className = "copy-link-btn";
    button.setAttribute("type", "button");
    div.append(pShort, button);
    li.appendChild(div);
    linksContainerEl.prepend(li);
}

const init = () => {
    // Load links from local storage
    linksArray = JSON.parse(localStorage.getItem("links")) || [];
    for(const link of linksArray) {
        const {original, short} = link;
        displayNewLink(original, short);
    }
}

const showError = () => {
    formInputEl.classList.add("error");
    errMsgEl.classList.add("show");
}

const hideError = () => {
    formInputEl.classList.remove("error");
    errMsgEl.classList.remove("show");
}

const shortenURL = async (url) => {
     try {
        const resp = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);

        if(!resp.ok) {
            throw new Error("Request failed")
        };

        const shortUrl = await resp.text(); 
        return shortUrl;

    } catch(error) {
        console.error(error);
    }
}

const handleSubmit = async(e) => {
    e.preventDefault();
    formEl.submitBtn.disable = true;
    const url = formInputEl.value.trim();

    if(!url) {
        showError();
        return;
    }

    const shortURL = await shortenURL(url);
    if(!shortURL) return;

    linksArray.push({original: url, short: shortURL});

    localStorage.setItem("links", JSON.stringify(linksArray));

    displayNewLink(url, shortURL);

    formInputEl.value = "";
    formEl.submitBtn.disable = false;
}

if(formEl) {
    formEl.addEventListener("submit", handleSubmit);
}

if(formInputEl) {
    formInputEl.addEventListener("input", hideError);
}

if(linksContainerEl) {
    linksContainerEl.addEventListener("click", async function(e) {
        const copyBtn = e.target.closest(".copy-link-btn");
        if(!copyBtn) return;

        const shortLinkURL = copyBtn.previousElementSibling.textContent;
        // Copy to clipboard
        await navigator.clipboard.writeText(shortLinkURL);

        // Change copy button styling and return to its original state after 3s
        copyBtn.classList.add("copy-link-btn-active");
        copyBtn.textContent = "Copied!"
        copyBtn.disabled = true;

        setTimeout(() => {
            copyBtn.classList.remove("copy-link-btn-active");
            copyBtn.textContent = "Copy";
            copyBtn.disabled = false;
        }, 2000);

    });
}

init();