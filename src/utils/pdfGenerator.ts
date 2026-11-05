import { Order, PaymentReceipt } from '../types';
import { formatBRL, formatDate } from './formatters';

export interface AdminPaymentConditionInput {
  order: Order;
  settledInstallments?: number;
  customTermsNote?: string;
  firstDueDate?: string;
  pixKey?: string;
  adminEmail?: string;
  adminWhatsApp?: string;
  paymentReceipts?: PaymentReceipt[];
}

function formatReceiptDate(dateStr: string): string {
  if (!dateStr) return '-';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  }
  return dateStr;
}

/**
 * Gera um documento PDF oficial da VASCONCELOS com os produtos selecionados,
 * entrega fixa VasconcelosExpress (R$ 0,00), histórico de datas e valores recebidos
 * pelo ADM e cálculo automático do Saldo Restante da compra.
 */
export function generateOrderConditionsPdf(input: AdminPaymentConditionInput) {
  const {
    order,
    customTermsNote,
    firstDueDate,
    pixKey = order.pixCopiaECola || 'sandravasconcellossillva@gmail.com',
    adminEmail = 'sandravasconcellossillva@gmail.com',
    paymentReceipts = order.paymentReceipts || []
  } = input;

  const totalReceivedFromReceipts = paymentReceipts.reduce(
    (sum, r) => sum + Number(r.amount || 0),
    0
  );
  const totalReceived =
    paymentReceipts.length > 0
      ? totalReceivedFromReceipts
      : order.paymentStatus === 'paid'
        ? order.total
        : 0;

  const remainingBalance = Math.max(0, order.total - totalReceived);
  const isFullyPaid = remainingBalance <= 0.01;

  const paymentMethodLabel =
    order.paymentMethod === 'pix'
      ? 'PIX'
      : order.paymentMethod === 'credit_card'
        ? 'Cartão de Crédito'
        : 'Boleto / Parcelamento Direto Vasconcelos';

  const termsDescription =
    customTermsNote ||
    order.adminPaymentTerms ||
    (isFullyPaid
      ? `Compra 100% quitada junto à Administração Vasconcelos.`
      : `Controle de pagamento direto com a Administração Vasconcelos. Total pago até o momento: ${formatBRL(totalReceived)} | Saldo restante a pagar: ${formatBRL(remainingBalance)}.`);

  const dueInfo = firstDueDate || order.adminFirstDueDate || 'Conforme combinado com a Administração';

  const itemsRowsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e5e5e5; font-weight: 600;">
          ${item.name}
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e5e5e5; text-align: right;">
          ${formatBRL(item.price)}
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e5e5e5; text-align: right; font-weight: 700;">
          ${formatBRL(item.price * item.quantity)}
        </td>
      </tr>
    `
    )
    .join('');

  const receiptsRowsHtml =
    paymentReceipts.length > 0
      ? paymentReceipts
          .map(
            (r, idx) => `
      <tr>
        <td style="padding: 9px 12px; border-bottom: 1px solid #e5e5e5; font-family: monospace; font-weight: 700;">
          #${idx + 1}
        </td>
        <td style="padding: 9px 12px; border-bottom: 1px solid #e5e5e5; font-weight: 600;">
          ${formatReceiptDate(r.date)}
        </td>
        <td style="padding: 9px 12px; border-bottom: 1px solid #e5e5e5;">
          ${r.method || paymentMethodLabel}${r.note ? ` — ${r.note}` : ''}
        </td>
        <td style="padding: 9px 12px; border-bottom: 1px solid #e5e5e5; text-align: right; font-weight: 700; color: #065f46;">
          ${formatBRL(r.amount)}
        </td>
      </tr>
    `
          )
          .join('')
      : `
      <tr>
        <td colspan="4" style="padding: 14px; text-align: center; color: #666666; border-bottom: 1px solid #e5e5e5;">
          ${
            isFullyPaid
              ? `Pagamento integral de ${formatBRL(order.total)} confirmado pela Administração.`
              : 'Nenhum pagamento parcial lançado ainda. Saldo integral em aberto.'
          }
        </td>
      </tr>
    `;

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Pedido ${order.orderNumber} — Extrato & Saldo VASCONCELOS</title>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #111111;
      background: #F7F6F2;
      margin: 0;
      padding: 16px;
      font-size: 12px;
      line-height: 1.5;
    }
    .page {
      max-width: 780px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #d4d4d4;
      padding: 28px;
      border-radius: 14px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 12px;
      border-bottom: 2px solid #111111;
      padding-bottom: 18px;
      margin-bottom: 20px;
    }
    .brand-title {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 28px;
      font-weight: 600;
      letter-spacing: 0.22em;
      margin: 0;
    }
    .brand-sub {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.26em;
      color: #666666;
      margin-top: 4px;
    }
    .doc-badge {
      background: #111111;
      color: #ffffff;
      padding: 6px 12px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      border-radius: 6px;
      display: inline-block;
    }
    .section-title {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      color: #111111;
      margin: 22px 0 10px;
      padding-bottom: 6px;
      border-bottom: 1px solid #e5e5e5;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }
    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 12px;
      margin-top: 12px;
    }
    .card {
      background: #F7F6F2;
      border: 1px solid #e5e5e5;
      border-radius: 10px;
      padding: 14px;
    }
    .label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #666666;
      font-weight: 700;
    }
    .value {
      font-size: 14px;
      font-weight: 800;
      color: #111111;
      margin-top: 3px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
      font-size: 12px;
    }
    th {
      background: #F7F6F2;
      text-align: left;
      padding: 9px 12px;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #555555;
      border-bottom: 1px solid #d4d4d4;
    }
    .balance-banner {
      border-radius: 12px;
      padding: 16px;
      margin-top: 14px;
      border: 2px solid #111111;
      background: #fdf8f9;
    }
    .no-print-bar {
      max-width: 780px;
      margin: 0 auto 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
    }
    .btn {
      background: #111111;
      color: #ffffff;
      border: none;
      padding: 11px 18px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      width: 100%;
    }
    @media (max-width: 600px) {
      body { padding: 8px; }
      .page { padding: 16px; }
      .grid-2, .grid-3 { grid-template-columns: 1fr; }
    }
    @media print {
      body { padding: 0; background: #ffffff; }
      .page { border: none; padding: 12px; }
      .no-print-bar { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="no-print-bar">
    <button class="btn" onclick="window.print()">📄 Salvar em PDF / Compartilhar Comprovante</button>
  </div>

  <div class="page">
    <div class="header">
      <div>
        <h1 class="brand-title">VASCONCELOS</h1>
        <div class="brand-sub">Cosméticos & Alta Perfumaria</div>
        <div style="margin-top: 6px; font-size: 11px; color: #555;">
          Administração: <strong>${adminEmail}</strong>
        </div>
      </div>
      <div>
        <span class="doc-badge">Resumo de Compra & Controle de Saldo</span>
        <div style="margin-top: 6px; font-family: monospace; font-size: 14px; font-weight: 800;">
          Pedido Nº ${order.orderNumber}
        </div>
        <div style="font-size: 11px; color: #666;">
          Data do Pedido: ${formatDate(order.createdAt)}
        </div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="label">Cliente</div>
        <div class="value">${order.customer.name}</div>
        <div style="margin-top: 4px; font-size: 12px; color: #333;">
          <strong>Celular / WhatsApp:</strong> ${order.customer.phone || 'Não informado'}
        </div>
      </div>

      <div class="card">
        <div class="label">Modalidade de Entrega</div>
        <div class="value" style="color: #065f46;">VasconcelosExpress (GRÁTIS)</div>
        <div style="margin-top: 4px; font-size: 11px; color: #444;">
          Sem custos adicionais • Protocolo: <strong>${order.trackingCode || 'VSC-EXPRESS'}</strong>
        </div>
      </div>
    </div>

    <div class="section-title">1. Resumo do Saldo da Compra (Controle ADM)</div>
    <div class="grid-3">
      <div class="card" style="background: #ffffff; border: 1.5px solid #d4d4d4;">
        <div class="label">Valor Total da Compra</div>
        <div class="value" style="font-size: 18px;">${formatBRL(order.total)}</div>
        <div style="font-size: 10px; color: #666; margin-top: 2px;">Frete Grátis Incluso</div>
      </div>

      <div class="card" style="background: #ecfdf5; border: 1.5px solid #6ee7b7;">
        <div class="label" style="color: #065f46;">Total Já Recebido</div>
        <div class="value" style="font-size: 18px; color: #065f46;">${formatBRL(totalReceived)}</div>
        <div style="font-size: 10px; color: #047857; margin-top: 2px;">
          ${paymentReceipts.length} ${paymentReceipts.length === 1 ? 'pagamento registrado' : 'pagamentos registrados'}
        </div>
      </div>

      <div class="card" style="${
        isFullyPaid
          ? 'background: #ecfdf5; border: 1.5px solid #10b981;'
          : 'background: #fffbeb; border: 1.5px solid #f59e0b;'
      }">
        <div class="label" style="color: ${isFullyPaid ? '#065f46' : '#92400e'};">
          Saldo Restante a Pagar
        </div>
        <div class="value" style="font-size: 18px; color: ${isFullyPaid ? '#065f46' : '#b45309'};">
          ${isFullyPaid ? 'R$ 0,00 (QUITADO)' : formatBRL(remainingBalance)}
        </div>
        <div style="font-size: 10px; color: ${isFullyPaid ? '#047857' : '#92400e'}; margin-top: 2px;">
          ${isFullyPaid ? 'Compra 100% paga ✅' : `Próximo vencimento/previsão: ${dueInfo}`}
        </div>
      </div>
    </div>

    <div class="section-title">2. Histórico de Pagamentos Recebidos (Data & Valor)</div>
    <table>
      <thead>
        <tr>
          <th style="width: 60px;">Recibo</th>
          <th>Data que Recebeu</th>
          <th>Forma / Observação</th>
          <th style="text-align: right;">Valor Recebido</th>
        </tr>
      </thead>
      <tbody>
        ${receiptsRowsHtml}
      </tbody>
    </table>

    <div class="section-title">3. Produtos da Compra</div>
    <table>
      <thead>
        <tr>
          <th>Produto</th>
          <th style="text-align: center;">Qtd</th>
          <th style="text-align: right;">Unitário</th>
          <th style="text-align: right;">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRowsHtml}
      </tbody>
    </table>

    <div class="balance-banner">
      <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #8B1E3F; letter-spacing: 0.08em;">
        Observações & Condições da Administração
      </div>
      <div style="margin-top: 6px; font-size: 12px; color: #222;">
        ${termsDescription}
      </div>
      <div style="margin-top: 10px; padding-top: 8px; border-top: 1px dashed #d4d4d4; font-size: 11px;">
        <strong>Chave PIX / Contato Oficial:</strong>
        <span style="font-family: monospace; margin-left: 6px;">${pixKey}</span>
      </div>
    </div>

    <div style="margin-top: 24px; padding-top: 12px; border-top: 1px solid #e5e5e5; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; font-size: 10px; color: #777;">
      <div>
        <strong>VASCONCELOS • Cosméticos & Alta Perfumaria</strong><br />
        Controle financeiro emitido por ${adminEmail}
      </div>
      <div>
        Código do Pedido: <strong style="font-family: monospace; color: #111;">${order.orderNumber}</strong>
      </div>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 350);
    };
  </script>
</body>
</html>
  `;

  const printWin = window.open('', '_blank', 'width=900,height=850');
  if (printWin) {
    printWin.document.open();
    printWin.document.write(html);
    printWin.document.close();
  }
}
