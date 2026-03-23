package com.confeccao.sistema.controller;

import com.confeccao.sistema.model.FormaPagamento;
import com.confeccao.sistema.repository.FormaPagamentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/formas-pagamento")
@CrossOrigin("*")
public class FormaPagamentoController {

    @Autowired
    private FormaPagamentoRepository repository;

    @GetMapping
    public List<FormaPagamento> listarTodos() {
        return repository.findAll();
    }

    @PostMapping
    public FormaPagamento salvar(@RequestBody FormaPagamento formaPagamento) {
        return repository.save(formaPagamento);
    }

 // O erro 405 acontece se faltar o ("/{id}") aqui na frente!
    @PutMapping("/{id}")
    public FormaPagamento atualizar(@PathVariable Long id, @RequestBody FormaPagamento formaPagamento) {
        formaPagamento.setId(id);
        return repository.save(formaPagamento);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        repository.deleteById(id);
    }
}