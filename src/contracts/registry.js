// src/contracts/registry.js
// Junta cada arquivo de src/contracts/kits/financeiro/ (os "Contrato de Prestação de
// Serviços Advocatícios", com a forma de pagamento explícita) num único mapa — usado
// pela tela de impressão de contrato. Pra adicionar um tipo novo no futuro: crie o
// arquivo em kits/financeiro/, importe aqui e adicione uma entrada — nenhum outro
// arquivo do sistema precisa mudar (mesmo padrão de "registry" que o app original já
// usava em js/contract.js, com CONTRACT_TEMPLATES).
//
// Kit ADM e Kit Judicial (Procurações, Autorizações, Termos) moram em
// kits/adm/ e kits/judicial/ — são documentos de representação, não de honorários, por
// isso ficam fora deste registry (ver KitDocumentsModal.jsx).

import { buildContratoAposentadoria } from "./kits/financeiro/aposentadoria.js";
import { buildContratoAuxilioDoenca } from "./kits/financeiro/auxilioDoenca.js";
import { buildContratoAuxilioAcidente } from "./kits/financeiro/auxilioAcidente.js";
import { buildContratoDoencaOcupacional } from "./kits/financeiro/doencaOcupacional.js";
import { buildContratoTrabalhista } from "./kits/financeiro/trabalhista.js";
import { buildContratoLoasIdoso } from "./kits/financeiro/loasIdoso.js";
import { buildContratoLoasDeficiente } from "./kits/financeiro/loasDeficiente.js";
import { buildContratoMaternidade } from "./kits/financeiro/salarioMaternidade.js";

export const CONTRACT_TEMPLATES = {
    aposentadoria: {
        id: "aposentadoria",
        label: "Aposentadoria",
        matches: ["Aposentadoria"],
        title: "CONTRATO DE PRESTAÇÃO DE SERVIÇOS ADVOCATICIOS",
        buildBody: buildContratoAposentadoria
    },
    auxilio_doenca: {
        id: "auxilio_doenca",
        label: "Auxílio-Doença",
        matches: ["Auxílio-Doença", "Auxilio-Doença", "Auxílio Doença"],
        title: "CONTRATO DE PRESTAÇÃO DE SERVIÇOS ADVOCATICIOS",
        buildBody: buildContratoAuxilioDoenca
    },
    auxilio_acidente: {
        id: "auxilio_acidente",
        label: "Auxílio-Acidente",
        matches: ["Auxílio-Acidente", "Auxilio-Acidente"],
        title: "CONTRATO DE PRESTAÇÃO DE SERVIÇOS ADVOCATICIOS",
        buildBody: buildContratoAuxilioAcidente
    },
    doenca_ocupacional: {
        id: "doenca_ocupacional",
        label: "Doença Ocupacional",
        matches: ["Doença Ocupacional"],
        title: "CONTRATO DE PRESTAÇÃO DE SERVIÇOS ADVOCATÍCIOS",
        buildBody: buildContratoDoencaOcupacional
    },
    trabalhista: {
        id: "trabalhista",
        label: "Trabalhista",
        matches: ["Trabalhista"],
        title: "CONTRATO DE PRESTAÇÃO DE SERVIÇOS ADVOCATÍCIOS",
        buildBody: buildContratoTrabalhista
    },
    loas_idoso: {
        id: "loas_idoso",
        label: "LOAS Idoso",
        matches: ["LOAS Idoso"],
        title: "CONTRATO DE PRESTAÇÃO DE SERVIÇOS ADVOCATICIOS",
        buildBody: buildContratoLoasIdoso
    },
    loas_deficiente: {
        id: "loas_deficiente",
        label: "LOAS Deficiente",
        matches: ["LOAS Deficiente"],
        title: "CONTRATO DE PRESTAÇÃO DE SERVIÇOS ADVOCATICIOS",
        buildBody: buildContratoLoasDeficiente
    },
    maternidade: {
        id: "maternidade",
        label: "Salário Maternidade",
        matches: ["Maternidade"],
        title: "CONTRATO DE PRESTAÇÃO DE SERVIÇOS ADVOCATICIOS",
        buildBody: buildContratoMaternidade
    }
};

// Sugere qual template abrir primeiro no seletor, a partir do campo "Tipo de contrato /
// serviço" já preenchido no cadastro do cliente (ver ClientForm.jsx) — o usuário sempre
// pode trocar manualmente antes de imprimir.
export function suggestContractTemplateId(client) {
    const benefit = (client.benefit || "").toLowerCase();
    const match = Object.values(CONTRACT_TEMPLATES).find((template) =>
        template.matches.some((candidate) => benefit.includes(candidate.toLowerCase()))
    );
    return match ? match.id : "aposentadoria";
}
