// src/contracts/kits/judicial/index.js
// Migrado de: KIT_JUDICIAL.pdf (enviado por Felipe em 02/09/2026).
//
// Procuração Judicial e a carta de confirmação de honorários (Contrato RPV) variam pelo
// benefício — ver ../benefitLabels.js. Os outros 4 (Termo de Concordância, Declaração de
// Hipossuficiência, Do Patrocínio Gratuito, Termo de Renúncia) são fixos, exceto por uma
// variação: Hipossuficiência e Patrocínio Gratuito trocam de redação quando o caso é
// Trabalhista/Doença Ocupacional (isTrabalhista=true) — "Juízo Federal" vira "Juízo
// trabalhista", e "ação de concessão de benefício previdenciário" vira "AÇÃO
// TRABALHISTA".
//
// Trabalhista/Doença Ocupacional não têm a carta RPV (ver nota em ../benefitLabels.js).

import { clientFields } from "../../shared.js";

export function buildProcuracaoJudicial(client, judicialLabel) {
    const f = clientFields(client);

    return `
        <p>Pelo presente instrumento de Procuração o Sr. ${f.nome}, brasileiro (a), ${f.nacionalidade}, ${f.estadoCivil}, Portador da Cédula de Identidade nº. ${f.rg}, inscrito no CPF sob o nº. ${f.cpf}, residente e domiciliado ${f.endereco}.</p>

        <p><strong>OUTORGADAS: DÉBORA CRISTINA DOS SANTOS LOPES,</strong> brasileira, casada, advogada, inscrita na OAB/RJ sob o nº. 162.559, com escritório localizado na Av. Marechal Deodoro, nº 474, loja B, Jd. 25 de Agosto, Duque de Caxias/RJ.</p>

        <p><strong>PODERES:</strong> Os poderes da cláusulas "ad-judicia et Extra, para o foro em geral, conforme estabelecido no art.105, CPC, e os especiais para receber citação, renunciar, desistir, confessar, reconhecer a procedência do pedido, transigir, retirar documentos em repartições públicas, firmar compromisso, receber, dar quitação, firmar acordos, dar declarações, receber parcelas de acordo, receber alvarás e tudo o mais que necessário for ao fiel cumprimento do presente mandato, inclusive substabelecer no todo ou em parte os poderes ora recebidos, com ou sem reserva da mesma, especialmente para propor <strong>${judicialLabel}</strong> contra quem de direito.</p>

        <p style="text-align:center">Rio de Janeiro, ______ de _______________ de _______.</p>

        <div class="signature-block">
            <div class="signature-line"></div>
            <div>Contratante</div>
        </div>
    `;
}

// "Contrato de 30% RPV" — documento DIFERENTE do "Contrato de Prestação de Serviços"
// (esse último mora em ../financeiro/, um arquivo por benefício, com a forma de
// pagamento completa). Este aqui é a cartinha curta de confirmação de honorários que
// referencia o art. 18 da Resolução 405/2016 CJF — os dois nunca devem ser confundidos
// nem usar o mesmo título na impressão.
export function buildContratoRpv30(client, judicialLabel) {
    const f = clientFields(client);

    return `
        <p>Por este instrumento particular, ${f.nome}, brasileiro (a), ${f.nacionalidade}, ${f.estadoCivil}, Portador da Cédula de Identidade nº. ${f.rg}, inscrito no CPF sob o nº. ${f.cpf}, residente e domiciliado ${f.endereco}.</p>

        <p>Contrata <strong>DÉBORA CRISTINA DOS SANTOS LOPES,</strong> brasileira, casada, advogada, inscrita na OAB/RJ sob o nº. 162.559, com escritório localizado na Av. Marechal Deodoro, nº 474, loja B, Jd. 25 de agosto, Duque de Caxias/RJ.</p>

        <p>Pelo presente, venho confirmar nossos entendimentos verbais no sentido do patrocínio de requerimento <strong>${judicialLabel}</strong> no importe 30% a título de honorários a ser calculado com base nos atrasados de RPV a ser expedido pelo juízo em separado, conforme art. 18 da Resolução nº. 405/2016 CJF.</p>

        <p>Estando V.Sa. de acordo com os termos do presente, é favor manifestar-se expressamente, apondo o seu ciente no lugar indicado.</p>

        <p style="text-align:center">Duque de Caxias, _____ de ____________________ de ________.</p>

        <div class="signature-block">
            <div class="signature-line"></div>
            <div class="signature-name">Drª DÉBORA CRISTINA DOS S. LOPES</div>
            <div>Contratada</div>
        </div>
        <div class="signature-block">
            <div class="signature-line"></div>
            <div>CONTRATANTE</div>
        </div>
    `;
}

export function buildTermoConcordancia(client) {
    const f = clientFields(client);

    return `
        <p>Eu, ${f.nome} portador da carteira de identidade nº ${f.rg}, cadastrado sob o n° no CPF ${f.cpf}.</p>

        <p>Neste ato afirmo não ter efetuado nenhum pagamento ou adiantamento de honorários contratuais e que concordo com o destaque dos honorários em todos os termos do contrato assinado.</p>

        <p style="text-align:center">Duque de Caxias, _____ de ____________________ de ___________.</p>

        <div class="signature-block">
            <div class="signature-line"></div>
            <div class="signature-name">DÉBORA CRISTINA DOS SANTOS LOPES</div>
            <div>OAB/RJ 162.559</div>
        </div>

        <p style="margin-top:30px">Ciente: _____________________________________________</p>
    `;
}

export function buildDeclaracaoHipossuficiencia(client, isTrabalhista) {
    const f = clientFields(client);
    const juizo = isTrabalhista ? "Juízo trabalhista" : "Juízo Federal";

    return `
        <p>Sr(a) ${f.nome}, brasileiro (a), ${f.nacionalidade}, ${f.estadoCivil}, Portador da Cédula de Identidade nº. ${f.rg}, inscrito no CPF sob o nº. ${f.cpf}, residente e domiciliado ${f.endereco}.</p>

        <p>DECLARA para fins de prova junto ao ${juizo}, que não possui condições de arcar com o ônus processual, estando nas exatas condições da Lei nº 1060/50, e art. 98 CPC, carecendo, pois, dos benefícios da <strong>GRATUIDADE DE JUSTIÇA.</strong></p>

        <p style="text-align:center">Rio de Janeiro, ____ de _____________ de _______.</p>

        <div class="signature-block">
            <div class="signature-line"></div>
            <div>Assinatura</div>
        </div>
    `;
}

export function buildPatrocinioGratuito(client, isTrabalhista) {
    const acao = isTrabalhista ? "AÇÃO TRABALHISTA" : "ação de concessão de benefício previdenciário";

    return `
        <p><strong>DÉBORA CRISTINA DOS SANTOS LOPES,</strong> brasileira, casada, advogada, inscrita na OAB/RJ sob o nº. 162.559, com escritório localizado na Av. Marechal Deodoro, nº 474, loja B, Jd. 25 de Agosto, Duque de Caxias/RJ, <strong>DECLARA</strong>, para os fins de direito, que não está cobrando honorários advocatícios na ${acao} antecipadamente.</p>

        <p style="text-align:center">Rio de Janeiro, _____ de _____________ de __________.</p>

        <div class="signature-block">
            <div class="signature-line"></div>
            <div class="signature-name">DÉBORA CRISTINA DOS SANTOS LOPES</div>
            <div>OAB/RJ 162.559</div>
        </div>

        <p style="margin-top:30px">Ciente: _____________________________________________</p>
    `;
}

export function buildTermoRenuncia(client) {
    const f = clientFields(client);

    return `
        <p>Sr. ${f.nome}, brasileiro (a), ${f.nacionalidade}, ${f.estadoCivil}, Portador da Cédula de Identidade nº. ${f.rg}, inscrito no CPF sob o nº. ${f.cpf}, residente e domiciliado ${f.endereco}</p>

        <p>Venho por meio desta, <strong>RENUNCIAR</strong> ao valor de meu crédito que exceder a 60 salários mínimos, procedimento necessário para o devido ajuizamento e prosseguimento de meu pleito perante o Juizado Especial Federal.</p>

        <p>Por ser verdade firmo o presente.</p>

        <p style="text-align:center">Rio de Janeiro, ______ de __________ de __________.</p>

        <div class="signature-block">
            <div class="signature-line"></div>
            <div>Assinatura</div>
        </div>
    `;
}
