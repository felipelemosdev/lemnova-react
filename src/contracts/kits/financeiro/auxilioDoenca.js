// src/contracts/templates/auxilioDoenca.js
// Migrado de: aux_doença_-_aposentadoria.pdf (enviado por Felipe em 01/09/2026).
// Texto jurídico reproduzido literalmente, inclusive inconsistências do original
// ("IVALIDEZ" em vez de "INVALIDEZ" na Cláusula Primeira) — não corrigidas por pedido
// explícito de fidelidade total ao PDF.

import { clientFields } from "../../shared.js";

export function buildContratoAuxilioDoenca(client) {
    const f = clientFields(client);

    return `
        <p>Por este instrumento particular, o Sr. ${f.nome}, ${f.nacionalidade}, ${f.estadoCivil}, ${f.profissao}, Portador (a) da Cédula de Identidade nº ${f.rg}, inscrito no CPF sob o nº. ${f.cpf}, residente e domiciliado ${f.endereco}.</p>

        <p>Contrata a <strong>DÉBORA CRISTINA DOS SANTOS LOPES</strong>, brasileira, casada, advogada, inscrita na OAB/RJ sob o nº. 162.559, com escritório localizado na Avenida Marechal Deodoro, nº 474, loja B, Jd. 25 de Agosto, Duque de Caxias/RJ.</p>

        <p style="text-align:center"><strong>DO OBJETO</strong></p>
        <p><strong>Cláusula Primeira</strong>: O presente contrato tem como objeto a Prestação de Serviços de Assessoria Jurídica ao Contratante, no <strong>REQUERIMENTO DE AUXILIO DOENÇA e/ou APOSENTADORIA POR IVALIDEZ</strong>, em sede administrativo e/ou judicial, até o trâmite final do processo.</p>

        <p style="text-align:center"><strong>DAS OBRIGAÇÕES</strong></p>
        <p><strong>Cláusula Segunda:</strong> O Contratado se compromete a aplicar todo seu conhecimento jurídico e empenho a fim de obter o melhor resultado possível.</p>
        <p><strong>Cláusula Terceira:</strong> Contratante, visando o melhor resultado possível do processo previdenciário, se compromete a:</p>
        <p>a) Fornecer todas as informações e documentações necessárias ao deslinde processual, conforme requerido pela contratada;<br>
        b) Manter seus dados atualizados perante o Contratado, tendo a obrigação de informar imediatamente, toda e qualquer alteração de endereço, telefone ou e-mail;<br>
        d) Comparecer em todas as audiências, justificações judiciais ou justificações administrativas que forem solicitadas pelo Contratado;<br>
        e) Notificar o Contratado de qualquer alteração contributiva, como: desligamento do emprego, novo emprego, modificação nas contribuições como contribuinte individual, recebimento de qualquer benefício previdenciário, etc.;<br>
        f) Notificar o Contratado caso ocorra acidente de trabalho e de percurso;</p>
        <p><strong>Cláusula Quarta</strong>: O Contratante autoriza o Contratado a efetuar o reagendamento ou redistribuição da ação judicial caso haja necessidade, conforme entendimento do Contratado.</p>

        <p style="text-align:center"><strong>DOS HONORÁRIOS ADVOCATICIOS</strong></p>
        <p><strong>Cláusula Quinta:</strong> Em remuneração aos serviços prestados pelo Contratado, fica o Contratante obrigado, de forma irrevogável e irretratável, e irrepetível ao pagamento de honorários advocatícios em favor do contratado, da seguinte forma:</p>
        <p>a) No importe de 4 salários benefícios e 20% (trinta por cento) sobre o proveito econômico do processo a titulo de atrasados sendo concedido em administrativamente e/ou RPV- Precatório, em se tratando de beneficio de auxilio doença concedido em prazo indeterminado.<br>
        b) Em se tratando de beneficio de auxilio doença concedido com prazo determinado os honorários se torna exigível pelo importe de 30% (trinta por cento) do proveito econômico do processo.<br>
        c) Em sendo concedido aposentadoria por invalidez será exigível os honorários no importe de 6 salários benefícios e 30% (trinta por cento) sobre o proveito econômico do processo a titulo de atrasados sendo concedido em administrativamente e/ou RPV- Precatório.<br>
        d) 30% (trinta por cento) do valor do benefício caso seja fixado em tutela de urgência, pagamento que perdurará enquanto perdurar o recebimento por tutela de Urgência (liminar), não eximindo o pagamento dos horários conforme alíneas anteriores.</p>
        <p><strong>Parágrafo Primeiro:</strong> O contratante concorda com o destaque dos honorários contratuais sobre o total do RPV ou Precatório.</p>
        <p><strong>Parágrafo Segundo</strong>: Não havendo o destaque dos honorários advocatícios em RPV ou Precatório pelo judiciário, fica estipulado que o Contratante comparecerá em conjunto com o Contratado na agência bancária para levantamento do alvará e no mesmo ato o Contratado fará a transferência do percentual ora estipulado nesse instrumento contratual para a conta bancária que o contratado indicar ou optar pelo saque imediato.</p>
        <p><strong>Parágrafo Terceiro</strong>: Os honorários incluídos na condenação por arbitramento ou sucumbência pertencem ao Contratado, sem qualquer redução dos honorários contratuais.</p>
        <p><strong>Parágrafo Quarto</strong>: Os honorários recebidos enquanto perdurar o recebimento de benefícios por liminar em tutela de urgência são irrepetíveis, isto é, não serão devolvidos em nenhuma hipótese.</p>
        <p><strong>Parágrafo Quinto:</strong> As partes estabelecem que havendo atraso no pagamento dos honorários, haverá a correção monetária, juros de mora na proporção de 1% (um por cento) ao mês, acrescidos de multa de 20% (vinte por cento).</p>

        <p style="text-align:center"><strong>CUSTAS E DESPESAS</strong></p>
        <p><strong>Cláusula Sexta</strong>: Todas as despesas efetuadas pelo Contratado, ligadas direta ou indiretamente com o processo, incluindo-se fotocópias, emolumentos, viagens, custas, entre outros encargos relativos ao processo, ficarão a cargo do Contratante, desde que devidamente comprovadas.</p>
        <p><strong>Cláusula Sétima</strong>: À custa e demais despesas judiciais ou extrajudiciais correrão por conta exclusiva do Contratante, que será a única responsável pelas consequências do não pagamento das mesmas nas épocas oportunas;</p>

        <p style="text-align:center"><strong>DO VENCIMENTO ANTECIPADO</strong></p>
        <p><strong>Cláusula Oitava:</strong> O valor total dos honorários poderá ser considerado (a critério do Contratado) automaticamente vencido e imediatamente exigível, sendo passível de execução, sem prévia notificação ou interpelação judicial, e resguardado o direito aos honorários de sucumbência, acrescido de encargos contratuais.</p>
        <p>a) Se houver composição amigável realizada por qualquer uma das partes litigantes sem anuência do Contratado;<br>
        b) Quando não forem pagos os honorários nas datas estabelecidas, sejam integrais, sejam parcelados;<br>
        c) No caso do não prosseguimento da ação por qualquer circunstância;<br>
        d) Se for cassado o mandato sem culpa do Contratado.</p>
        <p><strong>Cláusula Nona</strong>: Fica o Contratado autorizado desde já a fazer a retenção de seus honorários quando do recebimento de valores devidos ao Contratante, advindos de êxito da demanda, ainda que parcial.</p>

        <p style="text-align:center"><strong>RESCISÃO CONTRATUAL</strong></p>
        <p><strong>Cláusula Décima</strong>: Faculta-se aos Contratados considerarem rescindido o presente contrato – mediante comunicação prévia -- e, por tal motivo, vencidos e imediatamente exigíveis os honorários previstos no contrato, como se a Contratante fosse vencedora na ação:</p>
        <p>a) na hipótese da Contratante vir a fazer acordo com a parte adversa sem o concurso e anuência expressa dos Contratados;<br>
        b) na hipótese da Contratante deixar de cumprir quaisquer das obrigações previstas neste contrato e não remediar o descumprimento dentro de (03) três dias, contados da data que lhe seja dado ciência (por qualquer forma), ressalvado o previsto no item (v) abaixo;<br>
        c) em razão de a Contratante deixar de realizar algum pagamento devido aos Contratados por prazo superior a 30 (trinta) dias, sem qualquer comunicação.<br>
        d) caso a Contratante resolva não prosseguir por motivos pessoais ou que independam da vontade, ou mesmo contratando novo (s) advogado (a) para a (s) causa (s) aludida (s) neste contrato, deduzindo-se, na hipótese, os valores eventualmente pagos.</p>
        <p><strong>Cláusula Décima Primeira:</strong> Em caso de rescisão do contrato pelo Contratante, sem justa causa, fica estabelecido que este seja responsável pelo pagamento dos serviços já prestados pelo advogado, até a data da rescisão, proporcionalmente ao período contratado, bem como pelo pagamento das despesas e encargos já efetuados, inclusive os relativos a eventual contratação de terceiros.</p>
        <p><strong>Cláusula Décima Segunda:</strong> Em caso de rescisão do contrato pelo advogado, por justa causa, fica estabelecido que o cliente não terá direito a qualquer reembolso ou restituição dos valores já pagos, e ficará responsável pelo pagamento das despesas e encargos já efetuados, inclusive os relativos a eventual contratação de terceiros.</p>
        <p><strong>Cláusula Décima Terceira:</strong> A justa causa para rescisão do contrato pelo advogado inclui, mas não se limita, ao não pagamento dos valores devidos pelo cliente, à inobservância das obrigações assumidas pelo cliente, à falta de boa-fé, à conduta ilícita ou imoral, ou à divulgação de informações confidenciais sem autorização.</p>
        <p><strong>Cláusula Décima Quarta:</strong> A inobservância por parte da Contratante, de qualquer cláusula deste instrumento acarretará a rescisão deste contrato, independente de notificações e avisos, ficando sujeito aos honorários pactuados, bem como, pagar multa no valor de 30% (trinta por cento) do valor total dos honorários acordados, se não acordado, será sobre o valor do proveito econômico, na sua ausência sobre o valor da causa, sem prejuízo das demais indenizações devidas ao advogado em razão da rescisão contratual;</p>
        <p><strong>Cláusula Décima Quinta:</strong> Em caso de rescisão contratual requerida pela Contratante, por meio de revogação de mandado ou substabelecimento, a mesma será obrigada a pagar além dos honorários pactuados uma multa de R$ 2.000,00, (dois mil reais).</p>
        <p><strong>Cláusula Décima Sexta:</strong> Em caso de desistência da ação, expressa ou tácita, será devido ao contratado:</p>
        <p>a) O valor de R$ 2.000,00, (dois mil reais), se a desistência for antes do ajuizamento da demanda;<br>
        b) O valor integral dos honorários advocatícios, se a desistência for após o ajuizamento da demanda ou substituição de procurador por revogação do mandado;</p>
        <p><strong>Parágrafo Único:</strong> A ausência do Contratante em audiências será considerada desistência do processo.</p>

        <p style="text-align:center"><strong>DISPOSIÇÕES GERAIS</strong></p>
        <p><strong>Cláusula Décima Sétima:</strong> Pelo pactuado neste contrato obrigam-se os Contratantes e seus sucessores (as).</p>
        <p><strong>Cláusula Décima Oitava:</strong> Fica acertado entre as partes que as informações prestadas entre as mesmas serão consideradas confidenciais e deverão ser mantido em absoluto sigilo por ambas. Sobretudo no que tange aos trabalhos técnico-jurídicos desenvolvidos pelos Contratados a Contratante deverá reservar sigilo perante terceiros, inclusive do teor do presente contrato. A obrigação de confidencialidade disposta nesta cláusula perdurará mesmo após o término, rescisão ou extinção do presente contrato;</p>
        <p><strong>Parágrafo único.</strong> A confidencialidade e o sigilo poderão ser violados desde que haja autorização pela outra parte por escrito.</p>
        <p><strong>Cláusula Décima Nona:</strong> Caso figurar mais de um Contratante no presente contrato, estes serão devedores solidários um dos outros (CC, art. 275).</p>
        <p><strong>Cláusula Vigésima:</strong> O presente contrato não tem caráter personalíssimo, podendo o Contratado ser representado por outro (s) advogado (s) em qualquer ato processual.</p>
        <p><strong>Cláusula Vigésima Primeira:</strong> O Contratante se compromete a fornecer informações verdadeiras e precisas ao Contratado, sob as penas da lei de responsabilidade civil (art. 186 do Código Civil) e criminal (art. 299 do Código Penal) em caso de informações falsas ou omitidas.</p>

        <p style="text-align:center"><strong>DO ACESSO AOS DADOS</strong></p>
        <p><strong>Cláusula Vigésima Segunda:</strong> O contratante autoriza o contratado a ter acesso e utilizar os dados pessoais fornecidos para fins relacionados ao cumprimento do objeto contratado, de acordo com a Lei de Proteção de Dados (Lei 13.709/2018). O contratante declara que os dados fornecidos são verdadeiros e estão atualizados, e assume a responsabilidade pela veracidade das informações prestadas.</p>

        <p style="text-align:center"><strong>DO FORO</strong></p>
        <p>Cláusula Vigésima Terceira: Estipulam o Foro da comarca de Duque de Caxias/RJ, para dirimir litígios decorrentes do presente contrato.</p>
        <p>E, por estarem assim contratados assinam o presente contrato em duas vias de igual teor.</p>

        <p style="text-align:center">Rio de Janeiro, _____ de __________ de _____.</p>

        <div class="signature-block">
            <div class="signature-line"></div>
            <div>ASSINATURA</div>
        </div>
    `;
}
