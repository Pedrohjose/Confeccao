const API_URL = 'http://localhost:8080/api/clientes';

// ==========================================
// 1. MÁSCARAS E VALIDAÇÕES (CPF/CNPJ e Telefone)
// ==========================================
function aplicarMascaraVisual(valor, tipo) {
    if (!valor) return '-';
    
    // Pega somente os números para garantir
    let v = valor.replace(/\D/g, ''); 
    
    if (tipo === 'cpfCnpj') {
        if (v.length === 11) {
            // Formata CPF: 223.132.131-32
            return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        } else if (v.length === 14) {
            // Formata CNPJ
            return v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
        }
    } else if (tipo === 'telefone') {
        if (v.length === 11) {
            // Formata Celular: (47) 99999-9999
            return v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (v.length === 10) {
            // Formata Fixo: (47) 3333-3333
            return v.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
    }
    
    // Se for algum formato muito antigo ou estranho, mostra como está no banco
    return valor; 
}
// --- CPF / CNPJ ---
function mascararCpfCnpj(input) {
    let valor = input.value.replace(/\D/g, ''); 

    if (valor.length > 14) valor = valor.substring(0, 14);

    if (valor.length <= 11) {
        valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
        valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
        valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
        valor = valor.replace(/^(\d{2})(\d)/, '$1.$2');
        valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
        valor = valor.replace(/\.(\d{3})(\d)/, '.$1/$2');
        valor = valor.replace(/(\d{4})(\d)/, '$1-$2');
    }
    input.value = valor;
}

function isCpfCnpjValido(valor) {
    if (!valor) return true; 
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length !== 11 && numeros.length !== 14) return false;
    if (/^(\d)\1+$/.test(numeros)) return false;
    return true;
}

// --- TELEFONE ---
function mascararTelefone(input) {
    let valor = input.value.replace(/\D/g, ''); // Tira tudo que não for número

    if (valor.length > 11) valor = valor.substring(0, 11); // Limita a 11 números (DDD + 9 dígitos)

    if (valor.length > 2) {
        valor = valor.replace(/^(\d{2})(\d)/g, '($1) $2'); // Coloca os parênteses no DDD
    }
    
    if (valor.length > 9) {
        // Formato Celular: (99) 99999-9999
        valor = valor.replace(/(\d{5})(\d)/, '$1-$2');
    } else if (valor.length > 8) {
        // Formato Fixo: (99) 9999-9999
        valor = valor.replace(/(\d{4})(\d)/, '$1-$2');
    }

    input.value = valor;
}

function isTelefoneValido(valor) {
    if (!valor) return true; // Se for opcional, deixa passar vazio
    const numeros = valor.replace(/\D/g, '');
    // O telefone deve ter 10 (fixo) ou 11 (celular) números
    if (numeros.length !== 10 && numeros.length !== 11) return false;
    return true;
}


// ==========================================
// 2. FUNÇÕES DE CRUD (Salvar, Listar, Editar, Deletar)
// ==========================================

// FUNÇÃO PARA SALVAR
async function salvarCliente() {
    const nome = document.getElementById('nome').value;
    const cpfCnpj = document.getElementById('cpfCnpj').value;
    const telefone = document.getElementById('telefone').value;

    if (!nome) { 
        alert('Digite ao menos o nome!'); 
        return; 
    }

    if (cpfCnpj && !isCpfCnpjValido(cpfCnpj)) {
        alert('O CPF ou CNPJ digitado é inválido ou está incompleto!');
        return;
    }

    // TRAVA DE SEGURANÇA DO TELEFONE
    if (telefone && !isTelefoneValido(telefone)) {
        alert('O Telefone digitado está incompleto! Digite o DDD e o número.');
        return;
    }

    const novoCliente = { nome, cpfCnpj, telefone };

    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novoCliente)
        });

        // Limpa os campos após salvar
        document.getElementById('nome').value = '';
        document.getElementById('cpfCnpj').value = '';
        document.getElementById('telefone').value = '';

        listarClientes(); 
        alert('Cliente salvo com sucesso!');
    } catch (error) {
        console.error('Erro ao salvar:', error);
        alert('Erro ao salvar cliente.');
    }
}

// FUNÇÃO PARA LISTAR
async function listarClientes() {
    try {
        const response = await fetch(API_URL);
        const clientes = await response.json();
        const corpoTabela = document.querySelector('#tabelaClientes tbody');
        
        corpoTabela.innerHTML = '';

        clientes.forEach(c => {
            // Aqui a mágica acontece: Passamos os dados pela nossa nova função visual!
            const cpfCnpjFormatado = aplicarMascaraVisual(c.cpfCnpj, 'cpfCnpj');
            const telefoneFormatado = aplicarMascaraVisual(c.telefone, 'telefone');

            corpoTabela.innerHTML += `
            <tr>
                <td>${c.id}</td>
                <td>${c.nome}</td>
                <td>${cpfCnpjFormatado}</td>
                <td>${telefoneFormatado}</td>
                <td>
                    <button class="btn" style="background: #ffc107" onclick="prepararEdicao(${c.id}, '${c.nome}', '${c.cpfCnpj || ''}', '${c.telefone || ''}')">Editar</button>
                    <button class="btn" style="background: #dc3545; color: white" onclick="deletarCliente(${c.id})">Deletar</button>
                </td>
            </tr>
            `;
        });
    } catch (error) {
        console.error('Erro ao listar:', error);
    }
}
async function deletarCliente(id) {
    if (confirm("Tem certeza que deseja excluir este cliente?")) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        listarClientes();
    }
}

function prepararEdicao(id, nome, cpf, tel) {
    document.getElementById('editId').value = id;
    document.getElementById('editNome').value = nome;
    document.getElementById('editCpf').value = cpf === 'null' ? '' : cpf;
    document.getElementById('editTelefone').value = tel === 'null' ? '' : tel;
    
    document.getElementById('modalEdicao').style.display = 'block';
}

function fecharModal() {
    document.getElementById('modalEdicao').style.display = 'none';
}

// FUNÇÃO PARA SALVAR A EDIÇÃO
async function salvarEdicao() {
    const id = document.getElementById('editId').value;
    const nome = document.getElementById('editNome').value;
    const cpfCnpj = document.getElementById('editCpf').value;
    const telefone = document.getElementById('editTelefone').value;

    if (!nome) { 
        alert('O nome não pode ficar vazio!'); 
        return; 
    }

    if (cpfCnpj && !isCpfCnpjValido(cpfCnpj)) {
        alert('O CPF ou CNPJ digitado é inválido ou está incompleto!');
        return;
    }

    // TRAVA DE SEGURANÇA DO TELEFONE NA EDIÇÃO
    if (telefone && !isTelefoneValido(telefone)) {
        alert('O Telefone digitado está incompleto! Digite o DDD e o número.');
        return;
    }

    const clienteAtualizado = { nome, cpfCnpj, telefone };

    try {
        await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(clienteAtualizado)
        });
        
        fecharModal();
        listarClientes();
        alert('Cliente atualizado com sucesso!');
    } catch (error) {
        alert("Erro ao atualizar!");
    }
}

window.onload = listarClientes;