function createCert() {
    const CN = document.getElementById("CN").value;
    const O = document.getElementById("O").value;
    const C = document.getElementById("C").value;
    let days = document.getElementById("days").value;

    const validation = validate(CN, O, C, days);
    if (validation !== "") {
        console.log("Alert", validation);
        alert(validation)
        return;
    }
    days = Number(days);
    const validity = 1;
    const subjectName = "country"
    if (subjectName === "country") {
        console.log("posting");
        fetch('/certs', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "CN": CN,
                "O": O,
                "C": C,
                "days": days
            })
        })
            .then(response => {
                if (!response.ok) {
                    response.json().then(body => {
                        alert(`Cannot create certificate Status: ${response.status}, Error: ${JSON.stringify(body)}`);
                    })
                }
                else {
                    return response.json();
                }
            })
            .then(response => console.log(JSON.stringify(response)))
            .then(listCerts())
    } else {
        //TODO: show error on UI
        console.log("error");
    }
}
function listCerts() {
    console.log("getting");
    fetch('/certs', {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    })
        .then(response => response.json())
        .then(response => {
            console.log(JSON.stringify(response));
            const certList = document.getElementById('certList');
            certList.innerHTML = '';

            for (const i in response) {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                <p>id: ${response[i].ID}, name: ${response[i].name}</p>
                <button onclick="download('${response[i].ID}')">Download</button>
                <button class="delete-button" onclick="deleteCert('${response[i].ID}', this)">Delete</button>`
                certList.appendChild(listItem);
            };
        })
}
function download(id) {
    window.location.href = `/certs/${id}`;
}
function deleteCert(id, button) {
    console.log("deleting");
    const listItem = button.closest('li');
    fetch(`/certs/${id}`, {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json'
        }
    })
        .then(response => response.json())
        .then(response => console.log(JSON.stringify(response)))
        .then(() => animateExplosion(listItem));
}

function animateExplosion(element) {
    element.classList.add('explode');
    element.addEventListener('animationend', () => {
        element.remove();
    });
}

function validate(CN, O, C, days) {
    if (CN === "") return "Common name cannot be empty";
    if (C === "") return "A country is needed";
    if (days === "") return "validity in days must be given";
    if (Number(days) < 1 || Number(days) > 365) return "validity must be between 1 and 365 days"
    return "";
}
