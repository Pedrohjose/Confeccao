document.addEventListener("DOMContentLoaded", function() {
    
    // 1. CARREGA O MENU
    fetch('/header.html')
        .then(response => response.text())
        .then(data => {
            const headerContainer = document.getElementById('header-container');
            if (headerContainer) headerContainer.innerHTML = data;
        })
        .catch(error => console.error('Erro ao carregar o menu:', error));

    // 2. CARREGA O RODAPÉ
    fetch('/footer.html')
        .then(response => response.text())
        .then(data => {
            const footerContainer = document.getElementById('footer-container');
            if (footerContainer) footerContainer.innerHTML = data;
        })
        .catch(error => console.error('Erro ao carregar o rodapé:', error));

});