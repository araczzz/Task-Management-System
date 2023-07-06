// To display error/success messages
function showError(errorElement, errorMessage) {
  document.querySelector("." + errorElement).classList.add("display-error");
  document.querySelector("." + errorElement).innerHTML = errorMessage;
}

// To clear error messages
function clearError() {
  let errors = document.querySelectorAll(".error");
  for (let error of errors) {
    error.classList.remove("display-error");
  }
}

// To clear success messages
function clearSuccess() {
  let errors = document.querySelectorAll(".success");
  for (let error of errors) {
    error.classList.remove("display-error");
  }
}

// Exporting the error/success display functions
export { showError, clearError, clearSuccess };
