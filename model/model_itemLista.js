import ModelError from "/model/ModelError.js";

export default class ItemLista {
    constructor(sequencial,quantidade,precoUnit,subtotal){
        this.setSequencial(sequencial);
        this.setQuantidade(quantidade);
        this.setPrecoUnit(precoUnit);
        this.setSubtotal(subtotal);
    }
    getSequencial(){
        return this.sequencial;
    }
    setSequencial(sequencial){
        ItemLista.validarSequencial(sequencial);
        this.sequencial = sequencial;
    }
    static validarSequencial(sequencial) {
        if(sequencial == null || sequencial == "" || sequencial == undefined)
          throw new ModelError("Sequencial não pode ser Nulo!");
        const padraoSequencial = /[0-9]{3}/;
        if (!padraoSequencial.match(sequencial)) 
          throw new ModelError("Sequencial deve ser composto de 3 números!");
    }
    getQuantidade(){
        return this.quantidade;
    }
    
    setQuantidade(quantidade){
        ItemLista.validarQuantidade(quantidade);
        this.quantidade = quantidade;
    }
    static validarQuantidade(quantidade){
        if(quantidade == null || quantidade == "" || quantidade == undefined)
            throw new ModelError("A quantidade não pode ser nula!");
        if(quantidade < 1)
            throw new ModelError("A quantidade deve ser no mínimo 1!");
        const padraoQuantidade = /[0-9] */;
        if (!padraoQuantidade.test(quantidade)) 
            throw new ModelError("Quantidade só pode conter números!");
    }
    getPrecoUnit(){
        return this.precoUnit;
    }

    setPrecoUnit(precoUnit){
        ItemLista.validarPrecoUnit(precoUnit);
        this.precoUnit = precoUnit;
    }
    static validarprecoUnit(precoUnit){
        if(precoUnit == null || precoUnit == "" || precoUnit == undefined)
            throw new ModelError("O Preço não pode ser nulo!");
        const padraoPrecoUnit = /[0-9]+,[0-9]/;
        if(!padraoPrecoUnit.test(precoUnit))
            throw new ModelError("O Preço está inválido! Ex:(10,00)")
    }
}