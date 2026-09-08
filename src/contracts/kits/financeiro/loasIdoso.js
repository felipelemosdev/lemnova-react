// src/contracts/templates/loasIdoso.js
// Migrado de: loas_idoso.pdf (enviado por Felipe em 01/09/2026). O texto do contrato
// principal é idêntico ao de LOAS Deficiente (mesmo modelo-base do escritório para
// requerimentos de LOAS) — a diferença entre os dois fica nos documentos de apoio
// (procuração, termo de responsabilidade com tabela de beneficiários, etc.), que ficam
// para a próxima leva de documentos, combinada com o Felipe.

import { clientFields } from "../../shared.js";

export function buildContratoLoasIdoso(client) {
    const f = clientFields(client);

    return `
        <p>Por este instrumento particular, ${f.nome}, Brasileiro, ${f.nacionalidade}, ${f.estadoCivil}, portador (a) da carteira de identidade n°.: ${f.rg}, inscrito (a) no CPF sob n°.: ${f.cpf}, Residente e domiciliado na ${f.endereco}. Contrata <strong>DÉBORA CRISTINA DOS SANTOS LOPES,</strong> brasileira, casada, advogada, inscrita na OAB/RJ sob o nº. 162.559, com escritório localizado na Av. Marechal Deodoro, nº 474, loja B, Jd. 25 de Agosto, Duque de Caxias/RJ.</p>

        <p><strong>Cláusula Primeira</strong>: O presente contrato tem como objeto a Prestação de Serviços de Assessoria Jurídica ao Contratante, no <strong>REQUERIMENTO DE LOAS – Beneficio Assistencial ao Idoso ou ao Portador de Deficiência.</strong></p>

        <p><strong>Cláusula Segunda:</strong> Os honorários advocatícios serão devidos em esfera administrativa o importe de cinco parcelas integrais do beneficio, acrescidos de trinta por cento sob os atrasados.</p>

        <p><strong>Parágrafo Primeiro:</strong> Em sede judicial serão devidos o importe de seis parcelas integrais do valor do beneficio, acrescidos de trinta por cento sob os atrasados.</p>

        <p><strong>Cláusula Terceira:</strong> As partes estabelecem que havendo atraso no pagamento dos honorários, serão cobrados juros de mora na proporção de 1% (um por cento) ao mês, acrescidos de multa de 20% (vinte por cento). A quitação do contrato terá seu inicio no primeiro pagamento de beneficio pelo contratante junto ao banco.</p>

        <p><strong>Cláusula Quarta:</strong> Todas as despesas efetuadas pelo <strong>CONTRATADO</strong>, ligadas direta ou indiretamente com o processo, incluindo-se fotocópias, emolumentos, viagens, custas, entre outros encargos relativos ao processo, ficarão a cargo do <strong>CONTRATANTE</strong>, desde que devidamente comprovadas.</p>

        <p><strong>Clausula Quinta:</strong> O contrato poderá ser rescindindo por qualquer das partes, no curso de sua execução, mediante previa notificação por escrito; em caso de substabelecimento sem reserva de poderes; renuncia do mandato outorgado; ou descumprimento do contrato.</p>

        <p><strong>Parágrafo primeiro:</strong> no caso de rescisão por parte do contratante serão devidas as despesas ate a data da rescisão do contrato; além de multa de 40% (quarenta por cento) da quantia ajustada pelos serviços ora contratados.</p>

        <p><strong>Parágrafo segundo:</strong> Caberá ainda a referida multa estipulada no parágrafo anterior no caso da ação vir a ser julgada improcedente ou extinta por culpa exclusiva do contratante, como por exemplo, falta em audiência, falta a pericias medicas, deixar de entregar documentos solicitados dentro do prazo estabelecido para atendimento de despachos e outros.</p>

        <p><strong>Cláusula Sexta:</strong> O Contratante fica obrigado a, sempre que houver mudança de endereço, telefone ou e-mail, comunicar imediatamente ao Contratado.</p>

        <p><strong>Cláusula Sétima:</strong> O presente contrato não tem caráter personalíssimo, podendo o Contratado ser representado por outro(s) advogado(s) em qualquer ato processual.</p>

        <p>Por estarem justos certos e contratados assinamos o presente instrumento, elegendo o foro de Duque de Caxias/RJ, para dirimir quaisquer duvidas provenientes deste contrato.</p>

        <p style="text-align:center">Rio de Janeiro, _______de _______________de ________.</p>

        <div class="signature-block">
            <div class="signature-line"></div>
            <div class="signature-name">Drª DÉBORA CRISTINA DOS S. LOPES</div>
            <div>Contratada</div>
        </div>
        <div class="signature-block">
            <div class="signature-line"></div>
            <div>Contratante</div>
        </div>
    `;
}
