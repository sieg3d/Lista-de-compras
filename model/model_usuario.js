import ModelError from "/model/ModelError.js";

export default class Usuario {
    constructor(nome,email){
        this.setNome(nome);
        this.setEmail(email);
    }
    getNome(){
        return this.nome;
    }
    setNome(nome){
        Usuario.validarNome(nome);
        this.nome = nome;
    }
    static validarNome(nome) {
        if(nome == null || nome == "" || nome == undefined)
          throw new ModelError("Seu nome não pode ser nulo!");
        if (nome.length > 40) 
          throw new ModelError("Seu nome deve ter até 40 caracteres!");
        const padraoNome = /[A-Z][a-z] */;
        if (!padraoNome.test(nome)) 
          throw new ModelError("Seu nome só pode conter letras!");
    }
    getEmail(){
        return this.email;
    }

    setEmail(email){
        Usuario.validarEmail(email);
        this.email = email;
    }
    static validarEmail(email){
        if(email == null || email == "" || email == undefined)
            throw new ModelError("Seu email não pode ser nulo!");
        const padraoEmail = /[a-zA-Z0-9._%-]+@[a-zA-Z0-9-]+.[a-zA-Z]{2,4}/;
        if (!padraoEmail.test(email)) 
            throw new ModelError("O Email do Aluno não foi digitado corretamente!");
    }
}