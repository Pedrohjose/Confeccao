// ATENÇÃO: Confirme se o Spring está na porta 8080 ou 8081
const API_URL = 'http://localhost:8080/api/formas-pagamento';

// SALVAR
async function salvarPagamento() {
    const nome = document.getElementById('nome').value;
    const tipo = document.getElementById('tipo').value;
    const parcelasMaximas = document.getElementById('parcelasMaximas').value;

    if (!nome || !tipo || !parcelasMaximas) { 
        alert('Preencha todos os campos!'); 
        return; 
    }

    const novaForma = {
        nome: nome,
        tipo: tipo,
        parcelasMaximas: parseInt(parcelasMaximas)
    };

    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novaForma)
        });

        // Limpar os campos após salvar
        document.getElementById('nome').value = '';
        document.getElementById('tipo').value = '';
        document.getElementById('parcelasMaximas').value = '';
        
        listarPagamentos(); 
    } catch (error) {
        alert('Erro ao salvar.');
    }
}

// LISTAR
async function listarPagamentos() {
    try {
        const response = await fetch(API_URL);
        const pagamentos = await response.json();
        const corpoTabela = document.querySelector('#tabelaPagamentos tbody');
        
        corpoTabela.innerHTML = '';

        pagamentos.forEach(p => {
            corpoTabela.innerHTML += `
			<tr>
                <td>${p.id}</td>
                <td>${p.nome}</td>
                <td>${p.tipo}</td>
                <td>${p.parcelasMaximas}x</td>
                <td>
                    <button class="btn" style="background: #ffc107" onclick="prepararEdicao(${p.id}, '${p.nome}', '${p.tipo}', ${p.parcelasMaximas})">Editar</button>
                    <button class="btn" style="background: #dc3545; color: white" onclick="deletarPagamento(${p.id})">Deletar</button>
                </td>
            </tr>
            `;
        });
    } catch (error) {
        console.error('Erro ao listar:', error);
    }
}

// DELETAR
async function deletarPagamento(id) {
    if (confirm("Tem certeza que deseja excluir esta forma de pagamento?")) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        listarPagamentos();
    }
}

// ABRIR MODAL DE EDIÇÃO
function prepararEdicao(id, nome, tipo, parcelasMaximas) {
    document.getElementById('editId').value = id;
    document.getElementById('editNome').value = nome;
    document.getElementById('editTipo').value = tipo;
    document.getElementById('editParcelas').value = parcelasMaximas;
    
    document.getElementById('modalEdicao').style.display = 'block';
}

// FECHAR MODAL
function fecharModal() {
    document.getElementById('modalEdicao').style.display = 'none';
}

// SALVAR EDIÇÃO
async function salvarEdicao() {
    const id = document.getElementById('editId').value;
    const nome = document.getElementById('editNome').value;
    const tipo = document.getElementById('editTipo').value;
    const parcelasMaximas = document.getElementById('editParcelas').value;

    const formaAtualizada = {
        nome: nome,
        tipo: tipo,
        parcelasMaximas: parseInt(parcelasMaximas)
    };

    try {
        await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formaAtualizada)
        });
        
        fecharModal();
        listarPagamentos();
    } catch (error) {
        alert("Erro ao atualizar!");
    }
}

window.onload = listarPagamentos;