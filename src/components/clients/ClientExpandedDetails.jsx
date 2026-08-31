// src/components/clients/ClientExpandedDetails.jsx
// Migrado de: buildClientExpandedContent(), createDetailItem(), createClientPdfBlock(),
// createClientDocumentItem() em js/clients.js. Conteúdo compartilhado pela visão em
// Cards e pela linha expandida da visão em Lista.
//
// Fidelidade ao original: os campos de Área jurídica, Status e os dados de
// contrato/RPV (valor, parcelas, datas) também não apareciam aqui no app original —
// eles ficam só no formulário de cadastro por enquanto (o app original também não os
// mostrava neste card de detalhes).

import { getDocumentLabel, formatFileSize } from "../../services/utils.js";

function DetailItem({ label, value, wide }) {
    return (
        <div className={`detail-item ${wide ? "wide" : ""}`}>
            <span>{label}</span>
            <strong>{value || "Não informado"}</strong>
        </div>
    );
}

export default function ClientExpandedDetails({ client, documents, onPreviewDocument, onPreviewClientPdf }) {
    const clientDocuments = documents.filter((doc) => doc.clientId === client.id);

    return (
        <>
            <div className="client-detail-grid">
                <DetailItem label="CPF" value={formatCpfDisplay(client.document)} />
                <DetailItem label="RG" value={client.rg} />
                <DetailItem label="Nacionalidade" value={client.nationality} />
                <DetailItem label="Estado civil" value={client.maritalStatus} />
                <DetailItem label="Profissão" value={client.profession} />
                <DetailItem label="Benefício" value={client.benefit} />
                <DetailItem label="Status do administrativo" value={client.administrativeStatus || "Em andamento"} />
                <DetailItem label="Telefone" value={client.phone} />
                <DetailItem label="Email" value={client.email} />
                <DetailItem label="Senha INSS" value={client.inssPassword || "Não informado"} />
                <DetailItem label="CEP" value={client.address?.cep || "Não informado"} />
                <DetailItem label="Rua" value={client.address?.street || "Não informado"} />
                <DetailItem label="Número" value={client.address?.number || "Não informado"} />
                <DetailItem label="Bairro" value={client.address?.district || "Não informado"} />
                <DetailItem
                    label="Cidade/UF"
                    value={[client.address?.city, client.address?.state].filter(Boolean).join(" - ") || "Não informado"}
                />
                <DetailItem label="Complemento" value={client.address?.complement || "Não informado"} />
                <DetailItem label="Observações" value={client.notes || "Sem observações"} wide />
            </div>

            {client.pdfData ? (
                <div className="client-documents-block">
                    <div>
                        <strong>PDF anexado ao cadastro</strong>
                        <span>{client.pdfName || "Arquivo PDF"} · {formatFileSize(client.pdfSize)}</span>
                    </div>
                    <div className="client-document-list">
                        <div className="client-document-item">
                            <div>
                                <strong>{client.pdfName || "Arquivo PDF"}</strong>
                                <span>Cadastro do cliente</span>
                            </div>
                            <button className="action-button" type="button" onClick={() => onPreviewClientPdf(client)}>
                                Visualizar
                            </button>
                            <span className="document-badge">PDF</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="client-documents-block">
                    <div>
                        <strong>PDF anexado ao cadastro</strong>
                        <span>Nenhum PDF anexado.</span>
                    </div>
                </div>
            )}

            <div className="client-documents-block">
                <div>
                    <strong>Processos judiciais vinculados</strong>
                    <span>
                        {clientDocuments.length
                            ? `${clientDocuments.length} processo(s) vinculado(s)`
                            : "Nenhum processo vinculado"}
                    </span>
                </div>
                <div className="client-document-list">
                    {clientDocuments.length === 0 ? (
                        <span className="empty-state">Nenhum processo judicial cadastrado para este cliente.</span>
                    ) : (
                        clientDocuments.map((documentItem) => (
                            <div key={documentItem.id} className="client-document-item">
                                <div>
                                    <strong>Processo {documentItem.title}</strong>
                                    <span>
                                        {documentItem.processPhase || "Cadastrado"} · {documentItem.fileName} ·{" "}
                                        {formatFileSize(documentItem.fileSize)}
                                    </span>
                                </div>
                                <button className="action-button" type="button" onClick={() => onPreviewDocument(documentItem)}>
                                    Visualizar
                                </button>
                                <span className="document-badge">{getDocumentLabel(documentItem.fileType)}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}

function formatCpfDisplay(document) {
    // O documento já é salvo formatado (ex: 000.000.000-00) pelo ClientForm, mas mantemos
    // esta função pequena caso algum registro antigo tenha sido salvo só com dígitos.
    const digits = String(document || "").replace(/\D/g, "");
    if (digits.length !== 11) return document || "";
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}
