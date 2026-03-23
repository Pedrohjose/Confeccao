// Endereços da sua API
const API_PEDIDOS = 'http://localhost:8080/api/pedidos';
const API_ITENS = 'http://localhost:8080/api/itens-pedido';
const API_CLIENTES = 'http://localhost:8080/api/clientes';
const API_PRODUTOS = 'http://localhost:8080/api/produtos';
const API_PAGAMENTOS = 'http://localhost:8080/api/formas-pagamento';

// Nosso carrinho de compras temporário
let carrinho = [];

// ==========================================
// 1. CARREGAR DADOS INICIAIS (Dropdowns)
// ==========================================
async function carregarSelects() {
	try {
		const selectCliente = document.getElementById('clienteId');
		const selectPagamento = document.getElementById('formaPagamentoId');
		const selectProduto = document.getElementById('produtoId');

		// Limpar as caixinhas antes de preencher
		selectCliente.innerHTML = '<option value="">Selecione um Cliente...</option>';
		selectPagamento.innerHTML = '<option value="">Selecione a Forma de Pagamento...</option>';
		selectProduto.innerHTML = '<option value="">Selecione um Produto...</option>';

		// Carrega Clientes
		const resClientes = await fetch(API_CLIENTES);
		const clientes = await resClientes.json();
		clientes.forEach(c => {
			selectCliente.innerHTML += `<option value="${c.id}">${c.nome}</option>`;
		});

		// Carrega Formas de Pagamento
		const resPagamentos = await fetch(API_PAGAMENTOS);
		const pagamentos = await resPagamentos.json();
		pagamentos.forEach(p => {
			selectPagamento.innerHTML += `<option value="${p.id}">${p.nome} (${p.tipo})</option>`;
		});

		// Carrega Produtos (BLINDADO CONTRA VALORES NULOS E PRODUTOS FANTASMAS)
		const resProdutos = await fetch(API_PRODUTOS);
		const produtos = await resProdutos.json();

		produtos.forEach(p => {
			// Se o produto não tiver nome (for null ou vazio), ele pula e ignora!
			if (!p.nome) return;

			// Criamos variáveis seguras para não quebrar o código
			const precoSeguro = p.preco || 0;
			const estoqueSeguro = p.estoque || 0;

			selectProduto.innerHTML += `<option value="${p.id}" data-preco="${precoSeguro}" data-estoque="${estoqueSeguro}">
				                ${p.nome} - R$ ${precoSeguro.toFixed(2)} (Estoque: ${estoqueSeguro})
				            </option>`;
		});

	} catch (error) {
		console.error("Erro ao carregar dados:", error);
	}
}

// ==========================================
// 2. LÓGICA DO CARRINHO DE COMPRAS
// ==========================================
function adicionarAoCarrinho() {
	const selectProduto = document.getElementById('produtoId');
	const quantidade = parseInt(document.getElementById('quantidade').value);

	if (selectProduto.value === "" || quantidade <= 0) {
		alert("Selecione um produto e uma quantidade válida!");
		return;
	}

	// Pega os dados do produto selecionado
	const opcaoSelecionada = selectProduto.options[selectProduto.selectedIndex];
	const produtoId = opcaoSelecionada.value;
	const produtoNome = opcaoSelecionada.text.split(' -')[0];
	const precoUnitario = parseFloat(opcaoSelecionada.getAttribute('data-preco'));

	// PEGANDO O ESTOQUE DISPONÍVEL DAQUELE PRODUTO
	const estoqueDisponivel = parseInt(opcaoSelecionada.getAttribute('data-estoque'));

	// Verifica quantos itens desse produto já estão no carrinho
	let qtdJaNoCarrinho = 0;
	carrinho.forEach(item => {
		if (item.produtoId === produtoId) {
			qtdJaNoCarrinho += item.quantidade;
		}
	});

	// VALIDAÇÃO DE ESTOQUE: A quantidade digitada + o que já tem no carrinho passa do estoque?
	if ((quantidade + qtdJaNoCarrinho) > estoqueDisponivel) {
		alert(`Quantidade inválida! O produto '${produtoNome}' tem apenas ${estoqueDisponivel} unidade(s) no estoque.`);
		return; // O 'return' cancela a ação e não deixa adicionar ao carrinho!
	}

	// Se passou pela validação, adiciona na nossa lista
	carrinho.push({
		produtoId: produtoId,
		nome: produtoNome,
		quantidade: quantidade,
		precoUnitario: precoUnitario,
		subtotal: quantidade * precoUnitario
	});

	atualizarTabelaCarrinho();
}

function removerDoCarrinho(index) {
	carrinho.splice(index, 1); // Remove o item da lista
	atualizarTabelaCarrinho();
}

function atualizarTabelaCarrinho() {
	const corpoTabela = document.querySelector('#tabelaCarrinho tbody');
	corpoTabela.innerHTML = '';
	let valorTotal = 0;

	carrinho.forEach((item, index) => {
		valorTotal += item.subtotal;
		corpoTabela.innerHTML += `
            <tr>
                <td>${item.nome}</td>
                <td>${item.quantidade}</td>
                <td>R$ ${item.precoUnitario.toFixed(2)}</td>
                <td>R$ ${item.subtotal.toFixed(2)}</td>
                <td><button class="btn" style="background: #dc3545; color: white; padding: 5px 10px;" onclick="removerDoCarrinho(${index})">X</button></td>
            </tr>
        `;
	});

	document.getElementById('valorTotalPedido').innerText = valorTotal.toFixed(2);
}

// ==========================================
// 3. SALVAR O PEDIDO NO BANCO (O Chefão)
// ==========================================
async function finalizarPedido() {
	const clienteId = document.getElementById('clienteId').value;
	const pagamentoId = document.getElementById('formaPagamentoId').value;
	const valorTotal = parseFloat(document.getElementById('valorTotalPedido').innerText);

	if (!clienteId || !pagamentoId || carrinho.length === 0) {
		alert("Selecione um Cliente, uma Forma de Pagamento e adicione itens ao carrinho!");
		return;
	}

	const novoPedido = {
		cliente: { id: parseInt(clienteId) },
		formaPagamento: { id: parseInt(pagamentoId) },
		valorTotal: valorTotal
	};

	try {
		// 1. Salva o Pedido Principal
		const resPedido = await fetch(API_PEDIDOS, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(novoPedido)
		});
		const pedidoSalvo = await resPedido.json();

		// 2. Salva os Itens (O JAVA VAI CUIDAR DO ESTOQUE AGORA!)
		for (const item of carrinho) {
			const novoItem = {
				pedido: { id: pedidoSalvo.id },
				produto: { id: parseInt(item.produtoId) }, // Só mandamos o ID!
				quantidade: item.quantidade,
				precoUnitario: item.precoUnitario
			};

			// Fazemos APENAS o POST para a API de Itens
			await fetch(API_ITENS, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(novoItem)
			});
		}

		alert("Pedido salvo com sucesso!");

		// Limpa a tela
		carrinho = [];
		atualizarTabelaCarrinho();
		document.getElementById('clienteId').value = "";
		document.getElementById('formaPagamentoId').value = "";
		document.getElementById('quantidade').value = "1";

		carregarSelects(); // Recarrega os selects para mostrar o estoque atualizado
		listarPedidos();

	} catch (error) {
		alert("Erro ao salvar pedido. Verifique o console.");
		console.error(error);
	}
}

// ==========================================
// 4. LISTAR PEDIDOS SALVOS (Com Botões)
// ==========================================
async function listarPedidos() {
	try {
		const response = await fetch(API_PEDIDOS);
		const pedidos = await response.json();
		const corpoTabela = document.querySelector('#tabelaPedidos tbody');

		corpoTabela.innerHTML = '';

		pedidos.forEach(p => {
			const dataPadraoBR = new Date(p.dataPedido).toLocaleDateString('pt-BR');

			corpoTabela.innerHTML += `
			<tr>
                <td><b>#${p.id}</b></td>
                <td>${dataPadraoBR}</td>
                <td>${p.cliente ? p.cliente.nome : 'N/A'}</td>
                <td>${p.formaPagamento ? p.formaPagamento.nome : 'N/A'}</td>
                <td style="color: #198754; font-weight: bold;">R$ ${p.valorTotal.toFixed(2)}</td>
                <td>
                    <button class="btn" style="background: #ed8936; color: white; padding: 5px 10px; margin-right: 5px;" onclick="verDetalhes(${p.id})">Ver Itens</button>
                    <button class="btn" style="background: #0d6efd; color: white; padding: 5px 10px;" onclick="digitalizarPedido(${p.id})">Digitalizar</button>
                </td>
            </tr>
            `;
		});
	} catch (error) {
		console.error('Erro ao listar pedidos:', error);
	}
}
// ==========================================
// 5. FUNÇÕES DO POPUP (MODAL)
// ==========================================
async function verDetalhes(pedidoId) {
	try {
		const res = await fetch(API_ITENS);
		const todosItens = await res.json();

		// Filtra para pegar só os itens que pertencem a este pedido
		const itensDoPedido = todosItens.filter(item => item.pedido && item.pedido.id === pedidoId);

		// Preenche o ID do pedido no título do modal
		document.getElementById('detalhesIdPedido').innerText = `#${pedidoId}`;

		const corpoTabela = document.querySelector('#tabelaItensPedido tbody');
		corpoTabela.innerHTML = '';

		// Roda um laço de repetição nos itens filtrados e coloca na tabela do modal
		itensDoPedido.forEach(item => {
			corpoTabela.innerHTML += `
                <tr>
                    <td>${item.produto ? item.produto.nome : 'Produto Deletado'}</td>
                    <td>${item.quantidade}x</td>
                    <td>R$ ${item.precoUnitario.toFixed(2)}</td>
                    <td>R$ ${(item.quantidade * item.precoUnitario).toFixed(2)}</td>
                </tr>
            `;
		});

		// Abre o modal
		document.getElementById('modalDetalhes').style.display = 'block';

	} catch (error) {
		alert("Erro ao buscar os itens do pedido.");
		console.error(error);
	}
}
// ==========================================
// 6. GERAR RECIBO / DIGITALIZAR PEDIDO
// ==========================================
async function digitalizarPedido(pedidoId) {
	try {
		// 1. Busca todos os pedidos para achar os dados do cliente e totais
		const resPedidos = await fetch(API_PEDIDOS);
		const pedidos = await resPedidos.json();
		const pedido = pedidos.find(p => p.id === pedidoId);

		if (!pedido) {
			alert("Pedido não encontrado!");
			return;
		}

		// 2. Busca os itens específicos deste pedido
		const resItens = await fetch(API_ITENS);
		const todosItens = await resItens.json();
		const itensDoPedido = todosItens.filter(item => item.pedido && item.pedido.id === pedidoId);

		// 3. Monta os textos do recibo
		const dataPadraoBR = new Date(pedido.dataPedido).toLocaleDateString('pt-BR');
		const clienteNome = pedido.cliente ? pedido.cliente.nome : 'Cliente Deletado';
		const formaPagto = pedido.formaPagamento ? pedido.formaPagamento.nome : 'N/A';

		// Monta as linhas da tabela de itens
		let linhasHTML = '';
		itensDoPedido.forEach(item => {
			const nomeProduto = item.produto ? item.produto.nome : 'Produto Deletado';
			const subtotal = item.quantidade * item.precoUnitario;
			linhasHTML += `
                <tr>
                    <td>${nomeProduto}</td>
                    <td>${item.quantidade}</td>
                    <td>R$ ${item.precoUnitario.toFixed(2)}</td>
                    <td>R$ ${subtotal.toFixed(2)}</td>
                </tr>
            `;
		});

		// 4. Cria a tela de impressão (Recibo)
		const janela = window.open('', '', 'width=800,height=600');
		janela.document.write(`
            <html>
            <head>
                <title>Recibo - Pedido #${pedido.id}</title>
                <style>
                    body { font-family: 'Courier New', Courier, monospace; padding: 20px; color: #000; }
                    .cabecalho { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 20px; }
                    .info { margin-bottom: 20px; font-size: 14px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px; }
                    th, td { border-bottom: 1px solid #ccc; padding: 8px; text-align: left; }
                    .total { text-align: right; font-size: 18px; font-weight: bold; border-top: 2px dashed #000; padding-top: 10px; }
                    .rodape { text-align: center; margin-top: 30px; font-size: 12px; font-style: italic; }
                </style>
            </head>
            <body>
                <div class="cabecalho">
                    <h2>SISTEMA DE CONFECÇÃO</h2>
                    <p>Comprovante de Pedido #${pedido.id}</p>
                </div>
                
                <div class="info">
                    <p><strong>Data:</strong> ${dataPadraoBR}</p>
                    <p><strong>Cliente:</strong> ${clienteNome}</p>
                    <p><strong>Pagamento:</strong> ${formaPagto}</p>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Produto</th>
                            <th>Qtd</th>
                            <th>Valor Un.</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${linhasHTML}
                    </tbody>
                </table>

                <div class="total">
                    TOTAL DO PEDIDO: R$ ${pedido.valorTotal.toFixed(2)}
                </div>

                <div class="rodape">
                    Obrigado pela preferência!<br>
                    Este documento não tem valor fiscal.
                </div>

                <script>
                    // Assim que a página carregar, abre a tela de impressão e fecha a janela sozinha depois
                    window.onload = function() {
                        window.print();
                        window.onafterprint = function() { window.close(); }
                    }
                </script>
            </body>
            </html>
        `);
		janela.document.close();

	} catch (error) {
		console.error("Erro ao digitalizar pedido:", error);
		alert("Erro ao gerar o recibo do pedido.");
	}
}

function fecharModalDetalhes() {
	document.getElementById('modalDetalhes').style.display = 'none';
}

// Carrega os selects e a lista ao abrir a tela
window.onload = () => {
	carregarSelects();
	listarPedidos();
};