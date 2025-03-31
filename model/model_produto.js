import ModelError from "/model/ModelError.js";

export default class Produto {
    constructor(nome,quantidade,estoqueMin){
        this.setNome(nome);
        this.setQuantidade(quantidade);
        this.setEstoqueMin(estoqueMin);
    }
    getNome(){
        return this.nome;
    }
    setNome(nome){
        Produto.validarNome(nome);
        this.nome = nome;
    }
    static validarNome(nome) {
        if(nome == null || nome == "" || nome == undefined)
          throw new ModelError("Nome do Produto não pode ser Nulo!");
        if (nome.length > 20) 
          throw new ModelError("Nome do Produto deve ter até 20 caracteres!");
        const padraoNome = /[A-Z][a-z] */;
        if (!padraoNome.test(nome)) 
          throw new ModelError("Nome do Produto só pode conter letras!");
    }
    getQuantidade(){
        return this.quantidade;
    }

    setQuantidade(quantidade){
        Produto.validarQuantidade(quantidade);
        this.quantidade = quantidade;
    }
    static validarQuantidade(quantidade){
        if(quantidade == null || quantidade == "" || quantidade == undefined)
            throw new ModelError("A quantidade não pode ser nula!");
        if(quantidade < 0)
            throw new ModelError("A quantidade deve ser no mínimo 0!");
        const padraoQuantidade = /[0-9] */;
        if (!padraoQuantidade.test(quantidade)) 
            throw new ModelError("Quantidade só pode conter números!");
    }
    getEstoqueMin(){
        return this.estoqueMin;
    }

    setEstoqueMin(estoqueMin){
        Produto.validarEstoqueMin(estoqueMin);
        this.estoqueMin = estoqueMin;
    }
    static validarEstoqueMin(estoqueMin){
        if(estoqueMin == null || estoqueMin == "" || estoqueMin == undefined)
            throw new ModelError("O Estoque Mínimo não pode ser nulo!");
        if(estoqueMin < 0)
            throw new ModelError("O Estoque Mínimo deve ser no mínimo 0!");
        const padraoQuantidade = /[0-9] */;
        if (!padraoQuantidade.test(quantidade)) 
            throw new ModelError("Estoque Mínimo só pode conter números!");
    }
}