// src/contracts/templates/salarioMaternidade.js
// Migrado de: Salario_Maternidade.pdf (enviado por Felipe em 01/09/2026).

import { clientFields } from "../../shared.js";

export function buildContratoMaternidade(client) {
    const f = clientFields(client);

    return `
        <p>Por este instrumento particular, o Sra. ${f.nome}, ${f.nacionalidade}, ${f.estadoCivil}, ${f.profissao}, portador (a) da carteira de identidade n°.: ${f.rg}, inscrito (a) no CPF sob n°.: ${f.cpf}, Residente e domiciliado na ${f.endereco}.</p>

        <p>Contrata a <strong>DÉBORA CRISTINA DOS SANTOS LOPES</strong>, brasileira, casada, advogada, inscrita na OAB/RJ sob o nº. 162.559 com escritório localizado na Av. Marechal Deodoro, nº 474, loja B, Jd. 25 de Agosto, Duque de Caxias/RJ.</p>

        <p style="text-align:center"><strong>DO OBJETO</strong></p>
        <p><strong>Cláusula Primeira</strong>: O presente contrato tem como objeto a Prestação de Serviços de Assessoria Jurídica ao Contratante, no <strong>REQUERIMENTO DE SALÁRIO MATERNIDADE</strong> em sede administrativa e/ou judicial, até o trâmite final do processo.</p>

        <p style="text-align:center"><strong>DAS OBRIGAÇÕES</strong></p>
        <p><strong>Cláusula Segunda:</strong> O Contratado se compromete a aplicar todo seu conhecimento jurídico e empenho a fim de obter o melhor resultado possível.</p>
        <p><strong>Cláusula Terceira:</strong> Contratante, visando o melhor resultado possível do processo previdenciário, se compromete a:</p>
        <p>Fornecer todas as informações e documentações necessárias ao deslinde processual, conforme requerido pela contratada;<br>
        Manter seus dados atualizados perante o Contratado, tendo a obrigação de informar imediatamente, toda e qualquer alteração de endereço, telefone ou e-mail;<br>
        Comparecer em todas as audiências, justificações judiciais ou justificações administrativas que forem solicitadas pelo Contratado;<br>
        Notificar o Contratado de qualquer alteração contributiva, como: desligamento do emprego, novo emprego, modificação nas contribuições como contribuinte individual, Recebimento de qualquer benefício previdenciário, etc.; Notificar o Contratado caso ocorra acidente de trabalho e de percurso;</p>
        <p><strong>Cláusula Quarta:</strong> O Contratante autoriza o Contratado a efetuar o reagendamento ou redistribuição do processo administrativo ou da ação judicial caso haja necessidade, conforme entendimento do Contratado.</p>

        <p style="text-align:center"><strong>DOS HONORÁRIOS ADVOCATICIOS</strong></p>
        <p><strong>Cláusula Quinta:</strong> Em remuneração aos serviços prestados pelo Contratado, fica o Contratante obrigado, de forma irrevogável e irretratável, e irrepetível ao pagamento de honorários advocatícios em favor do contratado, da seguinte forma:</p>
        <p>No importe de 30% (trinta por cento) sobre o proveito econômico do processo.</p>
        <p><strong>Parágrafo Primeiro:</strong> O contratante concorda com o destaque dos honorários contratuais sobre o total do RPV ou Precatório.</p>
        <p><strong>Parágrafo Segundo:</strong> Não havendo o destaque dos honorários advocatícios em RPV ou Precatório pelo judiciário, fica estipulado que o Contratante comparecerá em conjunto com o Contratado na agência bancária para levantamento do alvará e no mesmo ato o Contratado fará a transferência do percentual ora estipulado nesse instrumento contratual para a conta bancária que o contratado indicar ou optar pelo saque imediato.</p>
        <p><strong>Parágrafo Terceiro:</strong> Os honorários incluídos na condenação por arbitramento ou sucumbência pertencem ao Contratado, sem qualquer redução dos honorários contratuais.</p>
        <p><strong>Parágrafo Quarto:</strong> As partes estabelecem que havendo atraso no pagamento dos honorários, haverá a correção monetária, juros de mora na proporção de 1% (um por cento) ao mês, acrescidos de multa de 20% (vinte por cento). Podendo a contratada executar o presente titulo.</p>

        <p style="text-align:center"><strong>CUSTAS E DESPESAS</strong></p>
        <p><strong>Cláusula Sexta:</strong> Todas as despesas efetuadas pelo Contratado, caso necessário, ligadas direta ou indiretamente com o processo, incluindo-se fotocópias, emolumentos, viagens, custas, entre outros encargos relativos ao processo, ficarão a cargo do Contratante, desde que devidamente comprovadas.</p>
        <p><strong>Cláusula Sétima:</strong> As custas e demais despesas judiciais ou extrajudiciais correrão por conta exclusiva do Contratante, que será a única responsável pelas consequências do não pagamento das mesmas nas épocas oportunas;</p>

        <p style="text-align:center"><strong>RESCISÃO CONTRATUAL</strong></p>
        <p><strong>Cláusula Oitava:</strong> O Contrato poderá ser rescindido por qualquer das partes, a qualquer momento, mediante prévia notificação por escrito: em caso de substabelecimento sem reserva de poderes, renúncia do mandato outorgado ou descumprimento do contrato.</p>
        <p><strong>Parágrafo primeiro:</strong> Na rescisão por parte do contratante serão devidas as despesas até a data da rescisão do contrato; além de multa de 15% a ser calculada sobre o crédito que teria direito a ser recebido pelo contratante.</p>
        <p><strong>Parágrafo segundo:</strong> No caso da ação vir a ser julgada improcedente ou extinta por culpa exclusiva do contratante, como por exemplo, falta em ato administrativo ou judicial, a não entrega de documentos solicitados dentro do prazo estabelecido e outros caberá ao contratado à cobrança de honorários no importe de 15% do valor do crédito que teria direito a ser recebido pelo contratante.</p>

        <p style="text-align:center"><strong>DISPOSIÇÕES GERAIS</strong></p>
        <p><strong>Cláusula Nona:</strong> Pelo pactuado neste contrato obrigam-se os Contratantes e seus sucessores (as).</p>
        <p><strong>Cláusula Décima:</strong> Fica acertado entre as partes que as informações prestadas entre as mesmas serão consideradas confidenciais e deverão ser mantido em absoluto sigilo por ambas. Sobretudo no que tange aos trabalhos técnico-jurídicos desenvolvidos pelos Contratados a Contratante deverá reservar sigilo perante terceiros, inclusive do teor do presente contrato. A obrigação de confidencialidade disposta nesta cláusula perdurará mesmo após o término, rescisão ou extinção do presente contrato;</p>
        <p><strong>Parágrafo único:</strong> A confidencialidade e o sigilo poderão ser violados desde que haja autorização pela outra parte por escrito.</p>
        <p><strong>Cláusula Décima Primeira:</strong> Caso figurar mais de um Contratante no presente contrato, estes serão devedores solidários um dos outros (CC, art. 275).</p>
        <p><strong>Cláusula Décima Segunda:</strong> O presente contrato não tem caráter personalíssimo, podendo o Contratado ser representado por outro (s) advogado (s) em qualquer ato processual.</p>
        <p><strong>Cláusula Décima Terceira:</strong> O Contratante se compromete a fornecer informações verdadeiras e precisas ao Contratado, sob as penas da lei de responsabilidade civil (art.186 do Código Civil) e criminal (art. 299 do Código Penal) em caso de informações falsas ou omitidas.</p>

        <p style="text-align:center"><strong>DO ACESSO AOS DADOS</strong></p>
        <p><strong>Cláusula Décima Quarta:</strong> O contratante autoriza o contratado a ter acesso e utilizar os dados pessoais fornecidos para fins relacionados ao cumprimento do objeto contratado, de acordo com a Lei de Proteção de Dados (Lei 13.709/2018). O contratante declara que os dados fornecidos são verdadeiros e estão atualizados, e assume a responsabilidade pela veracidade das informações prestadas.</p>

        <p style="text-align:center"><strong>DO FORO</strong></p>
        <p><strong>Cláusula Décima Quinta:</strong> Estipulam o Foro da comarca de Duque de Caxias/RJ, para dirimir litígios decorrentes do presente contrato.</p>
        <p>E, por estarem assim contratados assinam o presente contrato em duas vias de igual teor. Rubricando todas as páginas do presente contrato.</p>

        <p style="text-align:center">Duque de Caxias, _____ de _______________________ de ________.</p>

        <div class="signature-block">
            <div class="signature-line"></div>
            <div>Contratante</div>
        </div>
    `;
}
