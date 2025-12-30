// /js/utils/ui.js
export function showMessage(elementId, message, type) {
  const messageDiv = document.getElementById(elementId);
  if (!messageDiv) return;

  messageDiv.textContent = message;
  messageDiv.style.display = "block";
  messageDiv.style.padding = "12px";
  messageDiv.style.borderRadius = "5px";
  messageDiv.style.fontSize = "14px";
  messageDiv.style.marginTop = "10px";
  messageDiv.style.textAlign = "center";

  if (type === "success") {
    messageDiv.style.backgroundColor = "#d4edda";
    messageDiv.style.color = "#155724";
    messageDiv.style.border = "1px solid #c3e6cb";
  } else {
    messageDiv.style.backgroundColor = "#f8d7da";
    messageDiv.style.color = "#721c24";
    messageDiv.style.border = "1px solid #f5c6cb";
  }

  setTimeout(() => {
    messageDiv.style.display = "none";
  }, 5000);
}
