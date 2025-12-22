document.addEventListener("DOMContentLoaded", function () {
  fetch("components/sidebar.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("sidebar-container").innerHTML = data;

      adjustSidebarPaths();

      markActiveItem();

      setupToggle();
    })
    .catch((error) => console.error("Error al cargar sidebar:", error));
});

function adjustSidebarPaths() {
  const images = document.querySelectorAll("#sidebar-container img");
  images.forEach((img) => {
    const src = img.getAttribute("src");
    if (src && !src.startsWith("http")) {
      img.setAttribute("src", "assets/" + src);
    }
  });

  const links = document.querySelectorAll("#sidebar-container .sidebar__link");
  links.forEach((link) => {
    const href = link.getAttribute("href");
    if (href && !href.startsWith("http") && !href.startsWith("#")) {
      if (href.startsWith("pages/")) {
        link.setAttribute("href", href.replace("pages/", ""));
      }
    }
  });
}

function markActiveItem() {
  const currentPage = window.location.pathname.split("/").pop();
  const links = document.querySelectorAll(".sidebar__link");

  links.forEach((link) => {
    const href = link.getAttribute("href");
    if (href && href.includes(currentPage)) {
      link.classList.add("active");
    }
  });
}

function setupToggle() {
  const checkbox = document.querySelector("#checkbox-input");
  const mainContent = document.querySelector("#main-content");

  if (checkbox && mainContent) {
    checkbox.addEventListener("change", function () {
      if (this.checked) {
        mainContent.classList.remove("sidebar-collapsed");
      } else {
        mainContent.classList.add("sidebar-collapsed");
      }
    });
  }
}
