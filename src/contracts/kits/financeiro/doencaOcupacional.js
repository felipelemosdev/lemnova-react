// src/contracts/templates/doencaOcupacional.js
// Mesma estrutura/cláusulas de src/contracts/templates/trabalhista.js — por pedido do
// Felipe ("doença ocupacional e trabalhista são iguais no nome mas diferente em
// entrada"), todas as ocorrências do tipo de ação foram trocadas de
// "TRABALHISTA"/"RECLAMAÇÃO TRABALHISTA" para "DOENÇA OCUPACIONAL"/"AÇÃO DE DOENÇA
// OCUPACIONAL". Nenhuma outra cláusula foi alterada.
//
// Se algum dia o texto definitivo (PDF próprio de Doença Ocupacional) chegar, é só
// substituir o corpo desta função — a estrutura do resto do sistema (registry, botão de
// impressão) não muda.

import { clientFields } from "../../shared.js";

export function buildContratoDoencaOcupacional(client) {
    const f = clientFields(client);

    return `
        <p>Por este instrumento particular, ${f.nome}, ${f.nacionalidade}, ${f.estadoCivil}, ${f.profissao}, portador (a) da carteira de identidade n°.: ${f.rg}, inscrito (a) no CPF sob n°.: ${f.cpf}, Residente e domiciliado na ${f.endereco}.</p>

        <p>Contrata <strong>DÉBORA CRISTINA DOS SANTOS LOPES</strong>, brasileira, casada, advogada, inscrita na OAB/RJ sob o nº. 162.559, com escritório localizado na Av. Marechal Deodoro, nº 474, loja B, Jd. 25 de Agosto, Duque de Caxias/RJ.</p>

        <p><strong>Cláusula Primeira:</strong> O presente contrato tem como objeto a Prestação de Serviços de Assessoria Jurídica ao Contratante, com as seguintes medidas judiciais e/ou extrajudiciais: <strong>DOENÇA OCUPACIONAL</strong>.</p>

        <p><strong>Cláusula Segunda dos Honorários: HONORÁRIOS – FORMA DE PAGAMENTO:</strong> A título de remuneração (honorários advocatícios) pela <strong>AÇÃO DE DOENÇA OCUPACIONAL</strong>, os contratados receberão do contratante, o valor correspondente a:</p>

        <p><strong>Parágrafo Primeiro:</strong> 30% (trinta por cento) do valor total da condenação que serão pagos de uma única vez no final da Ação de Doença Ocupacional proposta, ou o mesmo percentual do número de parcelas de eventual acordo formalizado em juízo OU FORA DELE, se for o caso, tudo após o efetivo recebimento. O valor incidirá em todas as verbas alcançadas pela sentença e pelo acordo, inclusive Seguro-desemprego e levantamento do FGTS, contribuições previdenciárias etc.</p>

        <p><strong>Parágrafo Segundo:</strong> Havendo condenação a título de (Pensão Vitalícia) e o pensionamento ocorrer com inclusão na folha de pagamento mensal do CONTRATANTE e condenação também em outras parcelas indenizatórias ou salariais que, os honorários advocatícios, ora contratados, serão descontados, integralmente, sobre o valor deverá ser pago com os valores a serem recebidos a título dos valores atrasados, bem como da integralidade a ser recebida em Danos Morais e outros a serem concedidos no processo. Permanecendo, nesta hipótese, o pensionamento mensal, livre de honorários contratuais em favor do CONTRATANTE, desde que o valor total das parcelas Indenizatórias ou salariais suporte o pagamento integral dos honorários contratuais ora avençados.</p>

        <p><strong>Parágrafo Terceiro:</strong> As partes concordam que na hipótese do valor da condenação em em parcelas indenizatórias ou salariais não suporte o valor integral dos honorários contratuais, ora acordado que, a diferença será descontada no valor do pensionamento mensal, na razão de 30 (trinta por cento) até que se alcance o valor total a título dos honorários contratuais devidos referente a presente contratação, atualizados com juros e correção monetária.</p>

        <p><strong>Parágrafo Quarto:</strong> As partes concordam que, na hipótese de condenação exclusivamente a título de pensionamento, caso o pagamento seja realizado em uma única parcela, os honorários advocatícios contratados serão integralmente descontados sobre o valor recebido. Por outro lado, se o pagamento ocorrer de forma mensal, com inclusão do pensionamento na folha de pagamento do Contratante, os honorários serão quitados em parcelas sucessivas, deduzidas mensalmente dos valores recebidos, até que se alcance o valor total devido a título de honorários contratuais. O montante será atualizado com juros e correção monetária, conforme índices legais, até a sua completa quitação.</p>

        <p><strong>Cláusula Terceira:</strong> As partes estabelecem que havendo atraso no pagamento dos honorários, serão cobrados juros de mora na proporção de 1% (um por cento) ao mês, acrescidos de multa de 20% (vinte por cento).</p>

        <p><strong>Cláusula Quarta:</strong> Todas as despesas efetuadas pelo CONTRATADO, ligadas direta ou indiretamente com o processo, incluindo-se fotocópias, emolumentos, viagens, custas, entre outros encargos relativos ao processo, ficarão a cargo do CONTRATANTE, desde que devidamente comprovadas.</p>

        <p><strong>Cláusula Quinta:</strong> O contrato poderá ser rescindido por qualquer das partes, no curso de sua execução, mediante prévia notificação por escrito; em caso de restabelecimento sem reserva de poderes; renúncia do mandato outorgado; ou descumprimento do contrato.</p>

        <p><strong>Parágrafo primeiro:</strong> no de rescisão por parte do contratante serão devidas as despesas até a data da rescisão do contrato; além de multa de 40% (quarenta por cento) a ser calculada sobre o crédito que teria direito a ser recebido pelo contratante.</p>

        <p><strong>Parágrafo segundo:</strong> No caso da ação vir a ser julgada improcedente ou extinta por culpa exclusiva do contratante, como por exemplo, falta em audiência, falta a perícias médicas, deixar de entregar documentos solicitados dentro do prazo estabelecido para atendimento de despachos e outro caberá ao contratado à cobrança de honorários no importe de R$ 2.000,00 (dois mil reais).</p>

        <p><strong>Cláusula Sexta:</strong> O Contratante fica obrigado a, sempre que houver mudança de endereço, telefone ou e-mail, comunicar imediatamente ao Contratado.</p>

        <p><strong>Cláusula Sétima:</strong> O presente contrato não tem caráter personalíssimo, podendo o Contratado ser representado por outros advogados em qualquer ato processual.</p>

        <p>Por estarem justos certos e contratados assinam o presente instrumento, elegendo o foro de Duque de Caxias/RJ, para dirimir quaisquer dúvidas provenientes deste contrato.</p>

        <p style="text-align:center">Rio de Janeiro, _______/_______/_________</p>

        <p style="text-align:center"><strong>DÉBORA CRISTINA DOS SANTOS LOPES OAB/RJ 162.559</strong></p>

        <div class="signature-block">
            <div class="signature-line"></div>
            <div>Contratante</div>
        </div>
    `;
}
