// src/contracts/kits/benefitLabels.js
// Tabela de "palavras reservadas" por benefício — o nome que aparece em cada grupo de
// documento nem sempre é o nome comum do benefício (ex: Auxílio-Doença vira "Benefício
// por Incapacidade Temporária" no Kit ADM, mas "Ação de Concessão de Benefício
// Previdenciário" no Kit Judicial). Confirmado com o Felipe em 02/09/2026.
//
// Campos de cada entrada:
// - admLabel: nome usado no Kit ADM (Procuração, Autorização Meu INSS, Termo de
//   Representação). null quando o benefício não passa pelo INSS (Trabalhista, Doença
//   Ocupacional) — esses não têm Kit ADM.
// - judicialLabel: nome usado no Contrato RPV (carta de confirmação) e na Procuração
//   Judicial.
// - hasRpvLetter: se tem a cartinha de confirmação de honorários citando o art. 18 da
//   Resolução 405/2016 CJF. Trabalhista/Doença Ocupacional não têm — RPV é mecanismo da
//   Justiça Federal, não da Justiça do Trabalho. (Suposição a confirmar com o Felipe.)
// - isTrabalhista: controla a variação Hipossuficiência/Patrocínio Gratuito ("Juízo
//   Federal" x "Juízo trabalhista" / "ação previdenciária" x "AÇÃO TRABALHISTA").

export const BENEFIT_LABELS = {
    aposentadoria: {
        label: "Aposentadoria",
        admLabel: "Aposentadoria",
        judicialLabel: "Aposentadoria",
        hasAdmKit: true,
        hasRpvLetter: true,
        isTrabalhista: false
    },
    auxilio_doenca: {
        label: "Auxílio-Doença",
        admLabel: "Benefício por Incapacidade Temporária",
        judicialLabel: "Ação de Concessão de Benefício Previdenciário",
        hasAdmKit: true,
        hasRpvLetter: true,
        isTrabalhista: false
    },
    // Auxílio-Acidente: ADM confirmado ("Auxílio-Acidente" nos 3 documentos e sem Termo
    // de Representação). Judicial ainda aguardando confirmação do Felipe — por ora segue
    // a mesma label do Auxílio-Doença ("Benefício por Incapacidade Temporária"), que foi
    // o que ele descreveu, mas ele mesmo pediu pra confirmar antes de eu fechar isso.
    auxilio_acidente: {
        label: "Auxílio-Acidente",
        admLabel: "Auxílio-Acidente",
        judicialLabel: "Benefício por Incapacidade Temporária", // ⚠️ aguardando confirmação
        hasAdmKit: true,
        hasTermoRepresentacao: false,
        hasRpvLetter: true,
        isTrabalhista: false
    },
    maternidade: {
        label: "Salário Maternidade",
        admLabel: "Ação de Concessão de Benefício Previdenciário",
        judicialLabel: "Ação de Concessão de Benefício Previdenciário",
        hasAdmKit: true,
        hasRpvLetter: true,
        isTrabalhista: false
    },
    trabalhista: {
        label: "Trabalhista",
        admLabel: null,
        judicialLabel: "Ação Trabalhista",
        hasAdmKit: false,
        hasRpvLetter: false,
        isTrabalhista: true
    },
    doenca_ocupacional: {
        label: "Doença Ocupacional",
        admLabel: null,
        judicialLabel: "Ação de Doença Ocupacional",
        hasAdmKit: false,
        hasRpvLetter: false,
        isTrabalhista: true
    }

    // loas_idoso / loas_deficiente entram numa próxima leva — têm documentos extras
    // (Termo de Responsabilidade, Anexo I, Anexo II, Separação de fato) que ainda
    // dependem de definições do Felipe.
};

export function getBenefitLabels(benefitId) {
    return BENEFIT_LABELS[benefitId] || null;
}
