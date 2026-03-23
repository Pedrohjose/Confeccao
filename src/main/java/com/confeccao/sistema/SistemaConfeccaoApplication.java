package com.confeccao.sistema;

import com.confeccao.sistema.model.Cliente;
import com.confeccao.sistema.model.FormaPagamento;
import com.confeccao.sistema.model.Produto;
import com.confeccao.sistema.repository.ClienteRepository;
import com.confeccao.sistema.repository.FormaPagamentoRepository;
import com.confeccao.sistema.repository.ProdutoRepository;

import java.awt.Desktop;
import java.net.URI;
import java.math.BigDecimal;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Bean;
import org.springframework.context.event.EventListener;

@SpringBootApplication
public class SistemaConfeccaoApplication {

    public static void main(String[] args) {
        // ALTERAÇÃO AQUI: Desativamos o modo "headless" para o Java conseguir abrir programas (navegador) no seu computador
        new SpringApplicationBuilder(SistemaConfeccaoApplication.class).headless(false).run(args);
    }

    // O Spring roda esse método automaticamente quando o sistema inicia!
    @Bean
    CommandLineRunner initDatabase(ClienteRepository clienteRepo, 
                                   ProdutoRepository produtoRepo, 
                                   FormaPagamentoRepository pagamentoRepo) {
        return args -> {
            if (clienteRepo.count() == 0) {
                Cliente cliente = new Cliente();
                cliente.setNome("Cliente Padrão (Teste)");
                cliente.setCpfCnpj("12345678910");
                cliente.setTelefone("99999-9999");
                clienteRepo.save(cliente);
                System.out.println("✅ Cliente padrão criado com sucesso!");
            }

            if (produtoRepo.count() == 0) {
                Produto produto = new Produto();
                produto.setNome("Camiseta Básica de Teste");
                produto.setDescricao("Criada automaticamente pelo sistema");
                produto.setPreco(new BigDecimal("50.00"));
                produto.setEstoque(100);
                produtoRepo.save(produto);
                System.out.println("✅ Produto padrão criado com sucesso!");
            }

            if (pagamentoRepo.count() == 0) {
                FormaPagamento pagamento = new FormaPagamento();
                pagamento.setNome("Dinheiro");
                pagamento.setTipo("AVISTA");
                pagamento.setParcelasMaximas(1);
                pagamentoRepo.save(pagamento);
                System.out.println("✅ Forma de pagamento padrão criada com sucesso!");
            }
        };
    }

    @EventListener({ApplicationReadyEvent.class})
    public void abrirNavegador() {
        try {
            String url = "http://localhost:8080/cliente/cliente.html";
            if (Desktop.isDesktopSupported() && Desktop.getDesktop().isSupported(Desktop.Action.BROWSE)) {
                Desktop.getDesktop().browse(new URI(url));
                System.out.println("🌐 Navegador aberto automaticamente em: " + url);
            }
        } catch (Exception e) {
            System.out.println("⚠️ Não foi possível abrir o navegador: " + e.getMessage());
        }
    }
}