package com.confeccao.sistema.controller;

import com.confeccao.sistema.model.ItemPedido;
import com.confeccao.sistema.model.Produto;
import com.confeccao.sistema.repository.ItemPedidoRepository;
import com.confeccao.sistema.repository.ProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/itens-pedido")
@CrossOrigin("*")
public class ItemPedidoController {

	@Autowired
	private ItemPedidoRepository itemRepository;

	@Autowired
	private ProdutoRepository produtoRepository;

	@GetMapping
	public List<ItemPedido> listarTodos() {
		return itemRepository.findAll();
	}

	@PostMapping
	public ItemPedido salvar(@RequestBody ItemPedido item) {
		Produto produtoReal = produtoRepository.findById(item.getProduto().getId()).orElseThrow();

		produtoReal.setEstoque(produtoReal.getEstoque() - item.getQuantidade());

		produtoRepository.save(produtoReal);

		item.setProduto(produtoReal);
		return itemRepository.save(item);
	}
}