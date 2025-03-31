import ModelError from "/model/ModelError.js";

export default class Lista {
    constructor(nome,data,status){
        this.setNome(nome);
        this.setData(data);
        if(status === undefined || status === null)
            this.setStatus("CRIADA"); //Colocar depois o status correto, não sei qual era e coloquei CRIADA. : Rafael
          else
            this.setStatus(status);
    }
    getNome(){
        return this.nome;
    }
    setNome(nome){
        Lista.validarNome(nome);
        this.nome = nome;
    }
    static validarNome(nome) {
        if(nome == null || nome == "" || nome == undefined)
          throw new ModelError("Nome da Lista não pode ser Nulo!");
        if (nome.length > 20) 
          throw new ModelError("Nome da Lista deve ter até 20 caracteres!");
        const padraoNome = /[A-Z][a-z][0-9] */;
        if (!padraoNome.test(nome)) 
          throw new ModelError("Nome do Produto só pode conter letras e números!");
    }
    getData(){
        return this.data;
    }

    setData(data){
        Lista.validarData(data);
        this.data = data;
    }
    static validarData(data){
        if(data == null || data == "" || data == undefined)
            throw new ModelError("A data não pode ser nula!");
        const padraoData = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
        if (!padraoData.test(data)) 
            throw new ModelError("A data não foi digitado corretamente! Ex:(01/01/2001)");
    }
    getStatus(){
        return this.status;
    }

    setStatus(status){
        Lista.validarStatus(status);
        this.status = status;
    }
    static validarStatus(status){
        if(status != 'CRIADA' && status != "EM ANDAMENTO" && status != 'FINALIZADA') //Colocar aqui os status que quiser, coloquei esses por exemplo! : Rafael
            throw new ModelError("Status inválido!");
            
    }
}