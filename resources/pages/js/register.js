

const form = document.getElementById('registerForm');
let errorDiv = null;
let successDiv = null;
form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (errorDiv) {
        errorDiv.remove();
        errorDiv = null;
    }

    if (successDiv) {
        successDiv.remove();
        successDiv = null;
    }
    let alertType = "";
    await fetch('/register', {
        method: "POST",
        body: new FormData(form)
    })
        .then(response => {
            if (!response.ok) {
                alertType = "error";
                return response.text();
            } else {
                alertType = "success";
                return response.text();
            }
        })
        .then(data => createAlert(alertType, data))
        .catch(err => console.error('something went wrong', err));
});

function createAlert (alert, message) {
    if (alert === "error") {
        errorDiv = document.createElement('div');
        errorDiv.className = "alert alert-danger";
        errorDiv.role = "alert";
        errorDiv.textContent = message;
        errorDiv.clientWidth = 40;

        form.insertAdjacentElement('beforebegin', errorDiv);
    }

    if (alert === "success") {
        successDiv = document.createElement('div');
        successDiv.className = "alert alert-success";
        successDiv.role = "alert";
        successDiv.textContent = message;
        form.reset();
        form.insertAdjacentElement('beforebegin', successDiv);
    }
}