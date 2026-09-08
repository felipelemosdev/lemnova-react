// src/contracts/kits/adm/index.js
// Migrado de: KIT_ADM.pdf (enviado por Felipe em 02/09/2026).
//
// Os 3 primeiros documentos têm texto IDÊNTICO entre todos os benefícios — só o
// [nome do benefício] muda (ver ../benefitLabels.js para a tabela de qual nome usar em
// qual benefício). O Termo de Ciência contra Golpes é sempre o mesmo, sem variação.
//
// Benefícios sem Kit ADM (Trabalhista, Doença Ocupacional) não passam pelo INSS, então
// não têm Procuração ADM / Autorização Meu INSS / Termo de Representação.

import { clientFields } from "../../shared.js";

export function buildProcuracaoAdm(client, benefitLabel) {
    const f = clientFields(client);

    return `
        <p>Pelo presente instrumento de Procuração o Sr. ${f.nome}, brasileiro (a), ${f.nacionalidade}, ${f.estadoCivil}, Portador da Cédula de Identidade nº. ${f.rg}, inscrito no CPF sob o nº. ${f.cpf}, residente e domiciliado ${f.endereco}.</p>

        <p>Constitui como sua bastante procuradora <strong>DÉBORA CRISTINA DOS SANTOS LOPES,</strong> brasileira, casada, advogada, inscrita na OAB/RJ sob o nº. 162.559, com escritório localizado na Av. Marechal Deodoro, nº 474, loja B, Jd. 25 de Agosto, Duque de Caxias/RJ. Para representá-la junto à agência do INSS a fim de proceder ao Requerimento de <strong>${benefitLabel}</strong> bem como assuntos relativos ao supracitado requerimento.</p>

        <p style="text-align:center">Rio de Janeiro, ______ de ________________ de _________.</p>

        <div class="signature-block">
            <div class="signature-line"></div>
            <div>ASSINATURA</div>
        </div>
    `;
}

export function buildAutorizacaoInss(client, benefitLabel) {
    const f = clientFields(client);

    return `
        <p>Eu, ${f.nome} brasileiro (a), ${f.nacionalidade}, ${f.estadoCivil}, Portador da Cédula de Identidade nº. ${f.rg}, inscrito no CPF sob o nº. ${f.cpf}, residente e domiciliado ${f.endereco}.</p>

        <p>Venho, por meio desta, neste ato, <strong>AUTORIZAR</strong> o ESCRITÓRIO LOPES ADVOGADOS, inscrita na OAB/RJ 162.559, CPF n°097.475.827-24 na pessoa dos advogados subscritos na documentação de representação administrativa e judicial.</p>

        <p>(X) UTILIZAREM A SENHA DO PORTAL "MEU INSS" indispensável para realização do meu PEDIDO ADMINISTRATIVO DE <strong>${benefitLabel}</strong> em face do INSTITUTO NACIONAL DO SEGURO SOCIAL- INSS, dentre outras providencias que se fizerem necessárias junto ao INSS.</p>

        <p>Estou CIENTE que: NÃO PODEREI ALTERAR a referida senha, ATÉ O FINAL DO PROCESSO ADMINISTRATIVO E/OU JUDICIAL, sem prévio aviso, e que na hipótese de alteração por qualquer motivo que seja, deverá ser comunicado de imediato ao ESCRITÓRIO LOPES ADVOGADOS, sob pena de inviabilizar todo o trabalho a ser realizado pelos advogados contratados.</p>

        <p>Ressalta-se que a alteração da senha por parte do cliente, SEM PRÉVIO AVISO, ISENTARÁ aos advogados ora constituídos, de qualquer problema ou impedimento para cumprimento de suas obrigações, uma vez que, atualmente os pedidos são realizados de forma eletrônica através do Portal "meu.inss.gov.br".</p>

        <p>Este termo de consentimento foi elaborado em conformidade com a Lei Geral de Proteção de Dados Pessoais - LGPD. Consoante ao artigo 5º inciso XII da Lei 13.709, este documento viabiliza a manifestação livre, informada e inequívoca, pela qual o titular/ responsável concorda com o tratamento de seus dados pessoais e os dados do menor sob os seus cuidados, para a finalidade mencionada acima.</p>

        <p style="text-align:center">Rio de Janeiro, _____ de ______________ de ________.</p>

        <div class="signature-block">
            <div class="signature-line"></div>
            <div>ASSINATURA</div>
        </div>
    `;
}

export function buildTermoRepresentacao(client, benefitLabel) {
    const f = clientFields(client);

    return `
        <p>Eu ${f.nome}, ${f.nacionalidade}, ${f.estadoCivil}, ${f.profissao} portador da carteira de identidade n°.: ${f.rg}, inscrito no CPF sob n°.: ${f.cpf}, residente e domiciliado na ${f.endereco}.</p>

        <p>Representado(a) pela <strong>Dra. DÉBORA CRISTINADOS SANTOS LOPES</strong>, OAB/RJ 162.559, CPF nº 097.475.827-24, <strong>CONFIRO OS PODERES</strong> para me representar perante o INSS na solicitação de <strong>${benefitLabel}</strong>. E <strong>AUTORIZO</strong> a referida profissional a ter acesso a <strong>TODAS AS INFORMAÇÕES necessárias</strong> a subsidiar o requerimento eletrônico do serviço ou benefício indicado.</p>

        <p>Podendo, para tanto, praticar todos os atos necessários ao cumprimento deste mandato, em especial: Prestar informações, acompanhar requerimentos, cumprir exigências, ter vistas, Tomar ciência de decisões sobre processos de requerimento de benefícios operacionalizados pelo INSS.</p>

        <p style="text-align:center">Duque de Caxias, _____ / _____ / ______.</p>

        <div class="signature-block">
            <div class="signature-line"></div>
            <div>Assinatura do(a) Representado(a).</div>
        </div>

        <p style="text-align:center"><strong>TERMO DE RESPONSABILIDADE</strong></p>

        <p>Por este Termo de Responsabilidade, comprometo-me a comunicar ao INSS qualquer evento que possa anular esta procuração, no prazo de 30 dias, a contar da data em que o mesmo ocorrer, principalmente o óbito do segurado/pensionista, mediante apresentação da respectiva certidão.</p>

        <p>Estou ciente de que o descumprimento do compromisso ora assumido, além de obrigar a devolução de importâncias recebidas indevidamente, quando for o caso, sujeitar-me-á às penalidades previstas nos arts. 171 e 299 do Código Penal.</p>

        <p style="text-align:center">Duque de Caxias, ____ / ____ / ______</p>

        <div class="signature-block">
            <div class="signature-line"></div>
            <div>Assinatura do(a) Procurador(a)</div>
        </div>

        <p style="font-size:0.75rem;margin-top:30px"><strong>CÓDIGO PENAL</strong><br>
        <strong>Art. 171.</strong> Obter, para si ou para outrem, vantagem ilícita, em prejuízo alheio, induzindo ou mantendo alguém em erro, mediante artifício, ardil ou qualquer outro meio fraudulento.<br>
        <strong>Art. 299.</strong> Omitir, em documento público ou particular, declaração que devia constar, ou nele inserir ou fazer inserir declaração falsa ou diversa da que devia ser escrita, com o fim de prejudicar direito, criar obrigação ou alterar a verdade sobre fato juridicamente relevante.</p>
    `;
}

export function buildTermoCienciaGolpes(client) {
    const f = clientFields(client);

    return `
        <p>Eu, ${f.nome}. Portador da carteira de identidade de nº ${f.rg}, inscrito no CPF sob o nº ${f.cpf}</p>

        <p>Declaro para os devidos fins que estou ciente de que o escritório <strong>NÃO</strong> realiza cobrança antecipada de quaisquer valores para:</p>

        <p>
        • <strong>Liberação de processo;</strong><br>
        • <strong>Recebimento de valores judiciais;</strong><br>
        • <strong>Expedição de alvará;</strong><br>
        • <strong>Pagamento de custas inesperadas via telefone ou whatsapp;</strong><br>
        • <strong>Depósitos antecipados;</strong><br>
        • <strong>Taxas para "agilizar" processos;</strong><br>
        • <strong>Ou qualquer outra cobrança sem prévia formalização contratual.</strong>
        </p>

        <p>Estou ciente de que qualquer comunicação financeira será realizada exclusivamente pelos canais oficiais do escritório e mediante informação formal e clara. Em caso de recebimento de mensagens, ligações ou contatos suspeitos em nome do escritório, comprometo-me a entrar em contato imediatamente pelos canais oficiais para confirmação das informações, evitando possíveis golpes praticados por terceiros.</p>

        <div class="signature-block">
            <div class="signature-line"></div>
            <div><strong>Ciente</strong></div>
        </div>
    `;
}
