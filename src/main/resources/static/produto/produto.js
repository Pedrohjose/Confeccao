// ATENÇÃO À PORTA! Estou usando 8081, confirme se o seu Spring está rodando nela.
const API_URL = 'http://localhost:8080/api/produtos';
// SALVAR NOVO PRODUTO
async function salvarProduto() {
    const nome = document.getElementById('nome').value;
    const descricao = document.getElementById('descricao').value;
    const preco = document.getElementById('preco').value;
    const estoque = document.getElementById('estoque').value;

    if (!nome || !preco) { 
        alert('Nome e Preço são obrigatórios!'); 
        return; 
    }

    const novoProduto = { 
        nome: nome, 
        descricao: descricao, 
        preco: parseFloat(preco), 
        estoque: parseInt(estoque) 
    };

    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novoProduto)
        });

        // Limpa os campos
        document.getElementById('nome').value = '';
        document.getElementById('descricao').value = '';
        document.getElementById('preco').value = '';
        document.getElementById('estoque').value = '';

        listarProdutos(); 
    } catch (error) {
        alert('Erro ao salvar produto.');
    }
}

// LISTAR PRODUTOS
async function listarProdutos() {
    try {
        const response = await fetch(API_URL);
        const produtos = await response.json();
        const corpoTabela = document.querySelector('#tabelaProdutos tbody');
        
        corpoTabela.innerHTML = '';

        produtos.forEach(p => {
            // A MÁGICA ESTÁ AQUI: (p.preco || 0) impede que o sistema quebre se o preço for nulo!
            corpoTabela.innerHTML += `
			<tr>
                <td>${p.id}</td>
                <td>${p.nome}</td>
                <td>${p.descricao || '-'}</td>
                <td>R$ ${(p.preco || 0).toFixed(2)}</td>
                <td>${p.estoque || 0}</td>
                <td>
                    <button class="btn" style="background: #ffc107" onclick="prepararEdicao(${p.id}, '${p.nome}', '${p.descricao || ''}', ${p.preco || 0}, ${p.estoque || 0})">Editar</button>
                    <button class="btn" style="background: #dc3545; color: white" onclick="deletarProduto(${p.id})">Deletar</button>
                </td>
            </tr>
            `;
        });
    } catch (error) {
        console.error('Erro ao listar:', error);
    }
}
// DELETAR PRODUTO
async function deletarProduto(id) {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        listarProdutos();
    }
}

// ABRIR MODAL DE EDIÇÃO
function prepararEdicao(id, nome, descricao, preco, estoque) {
    document.getElementById('editId').value = id;
    document.getElementById('editNome').value = nome;
    document.getElementById('editDescricao').value = descricao;
    document.getElementById('editPreco').value = preco;
    document.getElementById('editEstoque').value = estoque;

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
    const descricao = document.getElementById('editDescricao').value;
    const preco = document.getElementById('editPreco').value;
    const estoque = document.getElementById('editEstoque').value;

    const produtoAtualizado = { 
        nome: nome, 
        descricao: descricao, 
        preco: parseFloat(preco), 
        estoque: parseInt(estoque) 
    };

    try {
        await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(produtoAtualizado)
        });
        
        fecharModal();
        listarProdutos();
    } catch (error) {
        alert("Erro ao atualizar!");
    }
}

// Carrega tudo ao iniciar
window.onload = listarProdutos;