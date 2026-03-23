package com.confeccao.sistema.model;

import jakarta.persistence.*;

@Entity
public class FormaPagamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String nome;
    private String tipo; 
    private Integer parcelasMaximas;

    public FormaPagamento() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public Integer getParcelasMaximas() {
        return parcelasMaximas;
    }

    public void setParcelasMaximas(Integer parcelasMaximas) {
        this.parcelasMaximas = parcelasMaximas;
    }
}