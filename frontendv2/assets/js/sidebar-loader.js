document.addEventListener("DOMContentLoaded", function () {
  loadSidebarCSS();

  loadSidebarHTML();
});

function loadSidebarCSS() {
  const cssId = "sidebar-styles";

  if (!document.getElementById(cssId)) {
    const link = document.createElement("link");
    link.id = cssId;
    link.rel = "stylesheet";
    link.href = getRelativePath() + "assets/css/components/sidebar.css";
    document.head.appendChild(link);
  }

  const materialIconsId = "material-icons";
  if (!document.getElementById(materialIconsId)) {
    const materialLink = document.createElement("link");
    materialLink.id = materialIconsId;
    materialLink.rel = "stylesheet";
    materialLink.href =
      "https://fonts.googleapis.com/icon?family=Material+Icons+Outlined";
    document.head.appendChild(materialLink);
  }
}

function loadSidebarHTML() {
  const sidebarPath = getRelativePath() + "components/sidebar.html";

  fetch(sidebarPath)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error al cargar sidebar: " + response.status);
      }
      return response.text();
    })
    .then((data) => {
      document.getElementById("sidebar-container").innerHTML = data;

      fixSidebarPaths();

      markActiveMenuItem();

      setupToggleListener();

      console.log("✅ Sidebar cargado correctamente");
    })
    .catch((error) => {
      console.error("❌ Error al cargar sidebar:", error);
      document.getElementById("sidebar-container").innerHTML = `
                <div style="padding: 20px; background: #f8d7da; color: #721c24; border-radius: 5px;">
                    <strong>Error:</strong> No se pudo cargar el sidebar.
                </div>
            `;
    });
}

function getRelativePath() {
  const path = window.location.pathname;
  const depth = (path.match(/\//g) || []).length;

  if (path.includes("/pages/")) {
    const afterPages = path.split("/pages/")[1];
    const subFolders = (afterPages.match(/\//g) || []).length;
    return "../".repeat(subFolders + 1);
  }

  return "../";
}

function fixSidebarPaths() {
  const basePath = getRelativePath();

  const images = document.querySelectorAll("#sidebar-container img");
  images.forEach((img) => {
    const src = img.getAttribute("src");
    if (src && !src.startsWith("http") && !src.startsWith("data:")) {
      const cleanSrc = src.replace(/^(\.\.\/)+/, "");
      img.setAttribute("src", basePath + cleanSrc);
    }
  });

  const links = document.querySelectorAll("#sidebar-container .sidebar__link");
  links.forEach((link) => {
    const href = link.getAttribute("href");
    if (href && !href.startsWith("http") && !href.startsWith("#")) {
      const cleanHref = href.replace(/^(\.\.\/)+/, "");
      link.setAttribute("href", basePath + cleanHref);
    }
  });
}

function markActiveMenuItem() {
  const currentPage = window.location.pathname.split("/").pop();
  const links = document.querySelectorAll(".sidebar__link");

  links.forEach((link) => {
    const href = link.getAttribute("href");

    if (href && href.includes(currentPage)) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

function setupToggleListener() {
  const checkbox = document.querySelector("#checkbox-input");
  const mainContent = document.querySelector("#main-content");

  if (checkbox && mainContent) {
    updateMainContentMargin(checkbox.checked);

    checkbox.addEventListener("change", function () {
      updateMainContentMargin(this.checked);
    });
  }
}

function updateMainContentMargin(isExpanded) {
  const mainContent = document.querySelector("#main-content");

  if (mainContent) {
    if (isExpanded) {
      mainContent.style.marginLeft = "0";
    } else {
      mainContent.style.marginLeft = "0";
    }

    if (isExpanded) {
      mainContent.classList.remove("sidebar-collapsed");
    } else {
      mainContent.classList.add("sidebar-collapsed");
    }
  }
}

function updateSidebarUser(userData) {
  const basePath = getRelativePath();

  const userName = document.querySelector(".user-id");
  const userRole = document.querySelector(".user-role");
  const userLogo = document.querySelector(".header-logo img");

  if (userName && userData.name) {
    userName.textContent = userData.name;
  }
  if (userRole && userData.role) {
    userRole.textContent = userData.role;
  }
  if (userLogo && userData.logo) {
    const logoSrc = userData.logo.startsWith("http")
      ? userData.logo
      : basePath + userData.logo;
    userLogo.src = logoSrc;
  }
}

window.updateSidebarUser = updateSidebarUser;
window.markActiveMenuItem = markActiveMenuItem;
