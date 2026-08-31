// src/components/clients/ClientForm.jsx
// Migrado de: <form id="clientForm"> em index.html + handleClientSubmit, fillClientForm,
// resetClientForm, validateClientCpf/Cep, lookupCep (via ViaCEP), handlePhotoPreview de
// js/clients.js.
//
// Desde a Fase 6 (Financeiro): salvar um cliente com status "Ativo" pela primeira vez
// chama generateInstallmentsIfNeeded() (services/api.js) — mesmo comportamento de
// maybeGenerateInstallmentsOnActivation() no app original. Ele gera as parcelas do
// contrato e já lança o espelho de cada uma no Financeiro (Contas a Receber).

import { useEffect, useRef, useState } from "react";
import { clientsApi, generateInstallmentsIfNeeded } from "../../services/api.js";
import { useApp } from "../../context/AppContext.jsx";
import { onlyDigits, formatCpf, formatCep, isValidCpf, fileToDataURL, isAllowedImage, isAllowedPdf } from "../../services/utils.js";
import { ADMINISTRATIVE_STATUS_OPTIONS } from "../../services/domain.js";

const BENEFIT_OPTIONS = [
    "Aposentadoria", "Auxílio-Doença", "Auxílio-Acidente", "Doença Ocupacional",
    "Pensão por Morte", "Trabalhista", "Maternidade", "Majoração", "LOAS Idoso",
    "LOAS Deficiente", "Consumidor"
];

const MARITAL_STATUS_OPTIONS = [
    "Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viúvo(a)", "União estável", "Separado de fato"
];

const AREA_OPTIONS = ["Cível", "Trabalhista", "Previdenciário"];

const STATUS_OPTIONS = ["Ativo", "Aguardando", "Em análise", "Recusado", "Arquivado"];

function emptyForm() {
    return {
        name: "",
        email: "",
        phone: "",
        inssPassword: "",
        document: "",
        rg: "",
        nationality: "Brasileiro(a)",
        maritalStatus: "",
        profession: "",
        address: { cep: "", street: "", number: "", district: "", city: "", state: "", complement: "" },
        area: "",
        benefit: "",
        status: "Ativo",
        contractValue: "",
        installmentsCount: "",
        firstPaymentDate: "",
        administrativeStatus: "Em andamento",
        rpvValue: "",
        rpvDate: "",
        notes: ""
    };
}

function clientToForm(client) {
    return {
        name: client.name || "",
        email: client.email || "",
        phone: client.phone || "",
        inssPassword: client.inssPassword || "",
        document: formatCpf(client.document || ""),
        rg: client.rg || "",
        nationality: client.nationality || "Brasileiro(a)",
        maritalStatus: client.maritalStatus || "",
        profession: client.profession || "",
        address: {
            cep: formatCep(client.address?.cep || ""),
            street: client.address?.street || "",
            number: client.address?.number || "",
            district: client.address?.district || "",
            city: client.address?.city || "",
            state: client.address?.state || "",
            complement: client.address?.complement || ""
        },
        area: client.area || "",
        benefit: client.benefit || "",
        status: client.status || "Ativo",
        contractValue: client.contractValue || "",
        installmentsCount: client.installmentsCount || "",
        firstPaymentDate: client.firstPaymentDate || "",
        administrativeStatus: client.administrativeStatus || "Em andamento",
        rpvValue: client.rpvValue || "",
        rpvDate: client.rpvDate || "",
        notes: client.notes || ""
    };
}

export default function ClientForm({ editingClient, onCancelEdit, onSaved }) {
    const { refresh } = useApp();
    const [form, setForm] = useState(() => (editingClient ? clientToForm(editingClient) : emptyForm()));
    const [cpfMessage, setCpfMessage] = useState({ text: "", type: "" });
    const [cepMessage, setCepMessage] = useState({ text: "", type: "" });
    const [photoPreview, setPhotoPreview] = useState(editingClient?.photoData || "");
    const [photoFile, setPhotoFile] = useState(null);
    const [pdfFile, setPdfFile] = useState(null);
    const lastCepLookupRef = useRef("");
    const nameInputRef = useRef(null);
    const numberInputRef = useRef(null);

    // Só o foco inicial precisa de efeito (o resto do "reset ao trocar de cliente" é
    // resolvido sem useEffect: veja o `key={editingClient?.id ?? "new"}` em
    // pages/Clientes.jsx, que remonta este componente do zero a cada troca — assim o
    // useState acima já nasce com os valores certos, sem precisar sincronizar depois).
    useEffect(() => {
        nameInputRef.current?.focus();
    }, []);

    function updateField(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    function updateAddressField(field, value) {
        setForm((prev) => ({ ...prev, address: { ...prev.address, [field]: value } }));
    }

    function handleCpfChange(event) {
        updateField("document", formatCpf(event.target.value));
        setCpfMessage({ text: "", type: "" });
    }

    function validateCpf() {
        const cpf = onlyDigits(form.document);
        if (!cpf) {
            setCpfMessage({ text: "", type: "" });
            return true;
        }
        if (!isValidCpf(cpf)) {
            setCpfMessage({ text: "CPF inválido.", type: "error" });
            return false;
        }
        setCpfMessage({ text: "CPF válido.", type: "success" });
        return true;
    }

    async function handleCepChange(event) {
        const formatted = formatCep(event.target.value);
        updateAddressField("cep", formatted);
        lastCepLookupRef.current = "";
        setCepMessage({ text: "", type: "" });

        if (onlyDigits(formatted).length === 8) {
            await lookupCep(formatted);
        }
    }

    function validateCep() {
        const cep = onlyDigits(form.address.cep);
        if (cep.length !== 8) {
            setCepMessage({ text: "CEP deve ter 8 dígitos.", type: "error" });
            return false;
        }
        return true;
    }

    async function lookupCep(rawCep) {
        const cep = onlyDigits(rawCep);
        if (cep.length !== 8 || lastCepLookupRef.current === cep) {
            return;
        }

        lastCepLookupRef.current = cep;
        setCepMessage({ text: "Buscando endereço...", type: "" });

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            if (!response.ok) throw new Error("Falha na consulta do CEP.");

            const data = await response.json();
            if (data.erro) {
                setCepMessage({ text: "CEP não encontrado.", type: "error" });
                return;
            }

            setForm((prev) => ({
                ...prev,
                address: {
                    ...prev.address,
                    street: data.logradouro || "",
                    district: data.bairro || "",
                    city: data.localidade || "",
                    state: data.uf || ""
                }
            }));
            setCepMessage({ text: "Endereço encontrado.", type: "success" });

            if (!form.address.number) {
                numberInputRef.current?.focus();
            }
        } catch {
            lastCepLookupRef.current = "";
            setCepMessage({ text: "Não foi possível consultar o CEP agora.", type: "error" });
        }
    }

    async function handlePhotoChange(event) {
        const file = event.target.files[0];
        if (!file) {
            setPhotoFile(null);
            setPhotoPreview("");
            return;
        }

        if (!isAllowedImage(file)) {
            alert("Envie uma foto 3x4 em JPG ou PNG.");
            event.target.value = "";
            setPhotoFile(null);
            setPhotoPreview("");
            return;
        }

        try {
            const dataURL = await fileToDataURL(file);
            setPhotoFile(file);
            setPhotoPreview(dataURL);
        } catch {
            alert("Não foi possível ler a foto selecionada.");
            event.target.value = "";
            setPhotoFile(null);
            setPhotoPreview("");
        }
    }

    function handlePdfChange(event) {
        const file = event.target.files[0];
        if (file && !isAllowedPdf(file)) {
            alert("Envie um arquivo em PDF para anexar ao cadastro do cliente.");
            event.target.value = "";
            setPdfFile(null);
            return;
        }
        setPdfFile(file || null);
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const isCpfValid = validateCpf();
        const isCepValid = validateCep();
        if (!isCpfValid || !isCepValid) {
            return;
        }

        let photoData = editingClient?.photoData || "";
        let photoName = editingClient?.photoName || "";
        let pdfData = editingClient?.pdfData || "";
        let pdfName = editingClient?.pdfName || "";
        let pdfSize = editingClient?.pdfSize || 0;

        if (photoFile) {
            try {
                photoData = await fileToDataURL(photoFile);
                photoName = photoFile.name;
            } catch {
                alert("Não foi possível ler a foto selecionada.");
                return;
            }
        }

        if (pdfFile) {
            try {
                pdfData = await fileToDataURL(pdfFile);
                pdfName = pdfFile.name;
                pdfSize = pdfFile.size;
            } catch {
                alert("Não foi possível ler o PDF selecionado.");
                return;
            }
        }

        const payload = {
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            inssPassword: form.inssPassword.trim(),
            document: form.document.trim(),
            rg: form.rg.trim(),
            nationality: form.nationality.trim(),
            maritalStatus: form.maritalStatus,
            profession: form.profession.trim(),
            address: {
                cep: form.address.cep.trim(),
                street: form.address.street.trim(),
                number: form.address.number.trim(),
                district: form.address.district.trim(),
                city: form.address.city.trim(),
                state: form.address.state.trim().toUpperCase(),
                complement: form.address.complement.trim()
            },
            area: form.area,
            benefit: form.benefit,
            status: form.status,
            contractValue: Number(form.contractValue) || 0,
            installmentsCount: Number(form.installmentsCount) || 0,
            firstPaymentDate: form.firstPaymentDate,
            administrativeStatus: form.administrativeStatus,
            rpvValue: Number(form.rpvValue) || 0,
            rpvDate: form.rpvDate,
            rpvReceived: editingClient?.rpvReceived || false,
            notes: form.notes.trim(),
            photoData,
            photoName,
            pdfData,
            pdfName,
            pdfSize
        };

        const previousStatus = editingClient?.status;
        let savedClient;

        try {
            if (editingClient) {
                savedClient = await clientsApi.update(editingClient.id, payload);
            } else {
                savedClient = await clientsApi.create(payload);
            }
        } catch {
            alert("Não foi possível salvar a foto no navegador. Tente uma imagem menor.");
            return;
        }

        // Gera as parcelas automaticamente só na transição para "Ativo" (cliente novo
        // já criado como Ativo, ou cliente existente que estava em outro status e virou
        // Ativo agora) — nunca gera de novo se o contrato já tem parcelas.
        await generateInstallmentsIfNeeded(savedClient, editingClient ? previousStatus : "");

        await refresh();
        onSaved();
    }

    return (
        <form id="clientForm" className="workspace-panel form-grid" onSubmit={handleSubmit}>
            <div className="section-heading full-width">
                <div>
                    <p className="eyebrow">Cadastro</p>
                    <h3 id="clientFormTitle">{editingClient ? "Editar cliente" : "Novo cliente"}</h3>
                </div>
                {editingClient ? (
                    <button id="cancelClientEdit" className="btn btn-ghost" type="button" onClick={onCancelEdit}>
                        Cancelar edição
                    </button>
                ) : null}
            </div>

            <div className="photo-field full-width">
                <div className="photo-preview" aria-hidden="true">
                    {photoPreview ? (
                        <img id="clientPhotoPreview" src={photoPreview} alt="" />
                    ) : (
                        <span id="clientPhotoPlaceholder">3x4</span>
                    )}
                </div>
                <label className="field">
                    <span>Foto 3x4</span>
                    <input id="clientPhoto" type="file" accept="image/jpeg,image/png,.jpg,.jpeg,.png" onChange={handlePhotoChange} />
                </label>
            </div>

            <label className="field">
                <span>Nome completo</span>
                <input
                    ref={nameInputRef}
                    id="clientName"
                    type="text"
                    placeholder="Nome do cliente"
                    required
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                />
            </label>

            <label className="field">
                <span>Email</span>
                <input
                    id="clientEmail"
                    type="email"
                    placeholder="cliente@email.com"
                    required
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                />
            </label>

            <label className="field">
                <span>Telefone</span>
                <input
                    id="clientPhone"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    required
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                />
            </label>

            <label className="field">
                <span>Senha INSS</span>
                <input
                    id="clientInssPassword"
                    type="text"
                    placeholder="Senha de acesso do INSS"
                    value={form.inssPassword}
                    onChange={(e) => updateField("inssPassword", e.target.value)}
                />
            </label>

            <label className="field">
                <span>CPF</span>
                <input
                    id="clientDocument"
                    type="text"
                    inputMode="numeric"
                    maxLength={14}
                    placeholder="000.000.000-00"
                    required
                    value={form.document}
                    onChange={handleCpfChange}
                />
                <small className={`validation-message ${cpfMessage.type}`}>{cpfMessage.text}</small>
            </label>

            <label className="field">
                <span>RG</span>
                <input
                    id="clientRg"
                    type="text"
                    placeholder="Número da carteira de identidade"
                    value={form.rg}
                    onChange={(e) => updateField("rg", e.target.value)}
                />
            </label>

            <label className="field">
                <span>Nacionalidade</span>
                <input
                    id="clientNationality"
                    type="text"
                    placeholder="Brasileiro(a)"
                    value={form.nationality}
                    onChange={(e) => updateField("nationality", e.target.value)}
                />
            </label>

            <label className="field">
                <span>Estado civil</span>
                <select id="clientMaritalStatus" value={form.maritalStatus} onChange={(e) => updateField("maritalStatus", e.target.value)}>
                    <option value="">Selecione</option>
                    {MARITAL_STATUS_OPTIONS.map((option) => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
            </label>

            <label className="field">
                <span>Profissão</span>
                <input
                    id="clientProfession"
                    type="text"
                    placeholder="Profissão do cliente"
                    value={form.profession}
                    onChange={(e) => updateField("profession", e.target.value)}
                />
            </label>

            <label className="field">
                <span>CEP</span>
                <input
                    id="clientCep"
                    type="text"
                    inputMode="numeric"
                    maxLength={9}
                    placeholder="00000-000"
                    required
                    value={form.address.cep}
                    onChange={handleCepChange}
                />
                <small className={`validation-message ${cepMessage.type}`}>{cepMessage.text}</small>
            </label>

            <label className="field">
                <span>Rua</span>
                <input
                    id="clientStreet"
                    type="text"
                    placeholder="Nome da rua"
                    required
                    value={form.address.street}
                    onChange={(e) => updateAddressField("street", e.target.value)}
                />
            </label>

            <label className="field">
                <span>Número</span>
                <input
                    ref={numberInputRef}
                    id="clientNumber"
                    type="text"
                    placeholder="Número"
                    value={form.address.number}
                    onChange={(e) => updateAddressField("number", e.target.value)}
                />
            </label>

            <label className="field">
                <span>Bairro</span>
                <input
                    id="clientDistrict"
                    type="text"
                    placeholder="Bairro"
                    required
                    value={form.address.district}
                    onChange={(e) => updateAddressField("district", e.target.value)}
                />
            </label>

            <label className="field">
                <span>Cidade</span>
                <input
                    id="clientCity"
                    type="text"
                    placeholder="Cidade"
                    required
                    value={form.address.city}
                    onChange={(e) => updateAddressField("city", e.target.value)}
                />
            </label>

            <label className="field">
                <span>Estado</span>
                <input
                    id="clientState"
                    type="text"
                    maxLength={2}
                    placeholder="UF"
                    required
                    value={form.address.state}
                    onChange={(e) => updateAddressField("state", e.target.value)}
                />
            </label>

            <label className="field">
                <span>Complemento</span>
                <input
                    id="clientComplement"
                    type="text"
                    placeholder="Sala, bloco ou referência"
                    value={form.address.complement}
                    onChange={(e) => updateAddressField("complement", e.target.value)}
                />
            </label>

            <label className="field">
                <span>Área jurídica</span>
                <select id="clientArea" required value={form.area} onChange={(e) => updateField("area", e.target.value)}>
                    <option value="">Selecione</option>
                    {AREA_OPTIONS.map((option) => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
            </label>

            <label className="field">
                <span>Tipo de contrato / serviço</span>
                <select id="clientBenefit" value={form.benefit} onChange={(e) => updateField("benefit", e.target.value)}>
                    <option value="">Selecione</option>
                    {BENEFIT_OPTIONS.map((option) => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
            </label>

            <label className="field">
                <span>Status</span>
                <select id="clientStatus" required value={form.status} onChange={(e) => updateField("status", e.target.value)}>
                    {STATUS_OPTIONS.map((option) => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
            </label>

            <label className="field">
                <span>Valor do contrato (R$)</span>
                <input
                    id="clientContractValue"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Ex: 4500.00"
                    value={form.contractValue}
                    onChange={(e) => updateField("contractValue", e.target.value)}
                />
            </label>

            <label className="field">
                <span>Nº de parcelas</span>
                <input
                    id="clientInstallmentsCount"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Ex: 6"
                    value={form.installmentsCount}
                    onChange={(e) => updateField("installmentsCount", e.target.value)}
                />
            </label>

            <label className="field">
                <span>Data do 1º pagamento</span>
                <input
                    id="clientFirstPaymentDate"
                    type="date"
                    value={form.firstPaymentDate}
                    onChange={(e) => updateField("firstPaymentDate", e.target.value)}
                />
            </label>

            <label className="field">
                <span>Status do administrativo</span>
                <select
                    id="clientAdministrativeStatus"
                    value={form.administrativeStatus}
                    onChange={(e) => updateField("administrativeStatus", e.target.value)}
                >
                    {ADMINISTRATIVE_STATUS_OPTIONS.map((option) => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
            </label>

            <label className="field">
                <span>RPV — valor previsto (R$)</span>
                <input
                    id="clientRpvValue"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Deixe em branco se não houver"
                    value={form.rpvValue}
                    onChange={(e) => updateField("rpvValue", e.target.value)}
                />
            </label>

            <label className="field">
                <span>RPV — data prevista</span>
                <input
                    id="clientRpvDate"
                    type="date"
                    value={form.rpvDate}
                    onChange={(e) => updateField("rpvDate", e.target.value)}
                />
            </label>

            <p className="field-hint full-width">
                Ao salvar o cliente com status <strong>Ativo</strong> pela primeira vez, as parcelas do contrato são
                geradas automaticamente (valor ÷ nº de parcelas). A 1ª parcela vence na "Data do 1º pagamento"
                informada e as seguintes são lançadas automaticamente no mesmo dia dos meses seguintes (ex: 1º
                pagamento 01/08, 2º 01/09...). Se a data não for informada, a 1ª parcela vence 1 mês a partir de
                hoje.
            </p>

            <p className="field-hint full-width">
                O RPV (30% sobre o valor recebido pela via judicial, referente ao tempo de espera) só{" "}
                <strong>entra em vigor</strong> quando o pedido administrativo é <strong>indeferido</strong> e o caso
                segue para a Justiça. Enquanto o status do administrativo estiver "Em andamento" ou "Deferido", o
                valor previsto fica só como anotação — não aparece como conta a receber na aba Contratos.
            </p>

            <label className="field full-width">
                <span>Anexar arquivo PDF</span>
                <input id="clientPdf" type="file" accept=".pdf,application/pdf" onChange={handlePdfChange} />
            </label>

            <label className="field full-width">
                <span>Observações</span>
                <textarea
                    id="clientNotes"
                    rows={4}
                    placeholder="Resumo do caso, próximos passos ou informações relevantes"
                    value={form.notes}
                    onChange={(e) => updateField("notes", e.target.value)}
                />
            </label>

            <button className="btn btn-primary full-width" type="submit">
                Salvar cliente
            </button>
        </form>
    );
}
