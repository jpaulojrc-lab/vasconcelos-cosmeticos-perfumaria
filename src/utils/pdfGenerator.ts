import { Order } from '../types';
import { formatBRL, formatDate } from './formatters';

export interface AdminPaymentConditionInput {
  order: Order;
  settledInstallments?: number;
  customTermsNote?: string;
  firstDueDate?: string;
  pixKey?: string;
  adminEmail?: string;
  adminWhatsApp?: string;
}

/**
 * Gera um documento PDF oficial da VASCONCELOS com os produtos selecionados,
 * entrega fixa VasconcelosExpress (R$ 0,00) e todas as condições de pagamento
 * estabelecidas pelo ADM (sandravasconcellossillva@gmail.com).
 */
export function generateOrderConditionsPdf(input: AdminPaymentConditionInput) {
  const {
    order,
    settledInstallments = 0,
    customTermsNote,
    firstDueDate,
    pixKey = order.pixCopiaECola || 'sandravasconcellossillva@gmail.com',
    adminEmail = 'sandravasconcellossillva@gmail.com'
  } = input;

  const totalInstallments = Math.max(1, order.installments || 1);
  const isInstallment = totalInstallments > 1;
  const installmentValue = order.total / totalInstallments;

  const paymentMethodLabel =
    order.paymentMethod === 'pix'
      ? 'PIX'
      : order.paymentMethod === 'credit_card'
        ? 'Cartão de Crédito'
        : 'Boleto / Parcelamento Direto Vasconcelos';

  const termsDescription =
    customTermsNote ||
    order.adminPaymentTerms ||
    (isInstallment
      ? `Pagamento parcelado em ${totalInstallments}x de ${formatBRL(installmentValue)} sem juros (${paymentMethodLabel}), conforme aprovado pela Administração.`
      : `Pagamento à vista em parcela única de ${formatBRL(order.total)} via ${paymentMethodLabel}.`);

  const dueInfo = firstDueDate || order.adminFirstDueDate || 'Conforme combinado com a Administração';

  // Gera as linhas do cronograma de parcelas
  const baseDate = new Date(order.createdAt || Date.now());
  const installmentsRowsHtml = Array.from({ length: totalInstallments }).map((_, idx) => {
    const parcelNumber = idx + 1;
    const isPaid =
      (order.paymentStatus === 'paid' && !isInstallment) ||
      parcelNumber <= settledInstallments;

    const parcelDate = new Date(baseDate);
    parcelDate.setMonth(parcelDate.getMonth() + idx);
    const dueLabel =
      idx === 0 && firstDueDate
        ? firstDueDate
        : idx === 0 && !isInstallment
          ? dueInfo
          : parcelDate.toLocaleDateString('pt-BR');

    return `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e5e5; font-family: monospace; font-weight: 700;">
          ${parcelNumber}ª / ${totalInstallments}
        </td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e5e5;">
          ${paymentMethodLabel}
        </td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e5e5;">
          ${dueLabel}
        </td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e5e5; font-weight: 700;">
          ${formatBRL(installmentValue)}
        </td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e5e5;">
          <span style="display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; ${
            isPaid
              ? 'background: #d1fae5; color: #065f46;'
              : 'background: #fef3c7; color: #92400e;'
          }">
            ${isPaid ? 'Quitada' : 'A Vencer / Pendente'}
          </span>
        </td>
      </tr>
    `;
  }).join('');

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

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Pedido ${order.orderNumber} — Condições de Pagamento VASCONCELOS</title>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #111111;
      background: #ffffff;
      margin: 0;
      padding: 32px;
      font-size: 12px;
      line-height: 1.5;
    }
    .page {
      max-width: 780px;
      margin: 0 auto;
      border: 1px solid #d4d4d4;
      padding: 36px;
      border-radius: 12px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #111111;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .brand-title {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 32px;
      font-weight: 600;
      letter-spacing: 0.24em;
      margin: 0;
    }
    .brand-sub {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.28em;
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
      border-radius: 4px;
      display: inline-block;
    }
    .section-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.16em;
      color: #111111;
      margin: 24px 0 10px;
      padding-bottom: 6px;
      border-bottom: 1px solid #e5e5e5;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .card {
      background: #F7F6F2;
      border: 1px solid #e5e5e5;
      border-radius: 8px;
      padding: 14px 16px;
    }
    .label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #666666;
      font-weight: 600;
    }
    .value {
      font-size: 13px;
      font-weight: 700;
      color: #111111;
      margin-top: 2px;
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
      padding: 10px 12px;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #555555;
      border-bottom: 1px solid #d4d4d4;
    }
    .conditions-box {
      background: #fdf8f9;
      border: 1.5px solid #8B1E3F;
      border-radius: 10px;
      padding: 18px 20px;
      margin-top: 16px;
    }
    .no-print-bar {
      max-width: 780px;
      margin: 0 auto 16px;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
    .btn {
      background: #111111;
      color: #ffffff;
      border: none;
      padding: 10px 18px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    @media print {
      body { padding: 0; }
      .page { border: none; padding: 16px; }
      .no-print-bar { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="no-print-bar">
    <button class="btn" onclick="window.print()">Salvar como PDF / Imprimir</button>
  </div>

  <div class="page">
    <div class="header">
      <div>
        <h1 class="brand-title">VASCONCELOS</h1>
        <div class="brand-sub">Cosméticos & Alta Perfumaria</div>
        <div style="margin-top: 8px; font-size: 11px; color: #555;">
          Administração & Consultoria: <strong>${adminEmail}</strong>
        </div>
      </div>
      <div style="text-align: right;">
        <span class="doc-badge">Documento de Pedido & Condições</span>
        <div style="margin-top: 8px; font-family: monospace; font-size: 15px; font-weight: 700;">
          Pedido Nº ${order.orderNumber}
        </div>
        <div style="font-size: 11px; color: #666;">
          Emitido em: ${formatDate(order.createdAt)}
        </div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="label">Dados do Cliente</div>
        <div class="value">${order.customer.name}</div>
        <div style="margin-top: 6px; font-size: 12px; color: #333;">
          <strong>WhatsApp:</strong> ${order.customer.phone || 'Não informado'}
        </div>
        ${
          order.shippingAddress?.logradouro && order.shippingAddress.logradouro !== 'Entrega Combinada via WhatsApp'
            ? `<div style="margin-top: 4px; font-size: 11px; color: #555;">Obs./Local: ${order.shippingAddress.logradouro}</div>`
            : ''
        }
      </div>

      <div class="card">
        <div class="label">Modalidade de Entrega</div>
        <div class="value" style="color: #065f46;">VasconcelosExpress</div>
        <div style="margin-top: 6px; font-size: 12px; color: #333;">
          <strong>Custo de Entrega:</strong> <span style="color: #065f46; font-weight: 700;">GRÁTIS (Sem custos adicionais)</span>
        </div>
        <div style="margin-top: 4px; font-size: 11px; color: #555;">
          Código de Rastreio / Protocolo: <strong>${order.trackingCode || 'VSC-EXPRESS'}</strong>
        </div>
      </div>
    </div>

    <div class="section-title">1. Produtos Selecionados</div>
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

    <div style="display: flex; justify-content: flex-end; margin-top: 12px;">
      <div style="width: 280px; background: #F7F6F2; padding: 12px 16px; border-radius: 8px; border: 1px solid #e5e5e5;">
        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
          <span>Subtotal Produtos:</span>
          <strong>${formatBRL(order.subtotal)}</strong>
        </div>
        ${
          order.discount > 0
            ? `<div style="display: flex; justify-content: space-between; font-size: 12px; color: #065f46; margin-bottom: 4px;">
                <span>Desconto Aplicado:</span>
                <strong>- ${formatBRL(order.discount)}</strong>
              </div>`
            : ''
        }
        <div style="display: flex; justify-content: space-between; font-size: 12px; color: #065f46; margin-bottom: 6px;">
          <span>Entrega (VasconcelosExpress):</span>
          <strong>R$ 0,00 (Grátis)</strong>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 15px; font-weight: 700; border-top: 1px solid #d4d4d4; padding-top: 6px;">
          <span>Total do Pedido:</span>
          <span>${formatBRL(order.total)}</span>
        </div>
      </div>
    </div>

    <div class="section-title">2. Condições de Pagamento Estabelecidas pela Administração</div>
    <div class="conditions-box">
      <div class="grid-2">
        <div>
          <div class="label" style="color: #8B1E3F;">Modalidade Aprovada pelo ADM</div>
          <div class="value" style="font-size: 15px; color: #8B1E3F;">
            ${isInstallment ? `Parcelado em ${totalInstallments}x de ${formatBRL(installmentValue)}` : `À Vista — ${formatBRL(order.total)}`}
          </div>
          <div style="font-size: 11px; color: #444; margin-top: 4px;">
            Meio de pagamento: <strong>${paymentMethodLabel}</strong>
          </div>
        </div>
        <div>
          <div class="label" style="color: #8B1E3F;">Vencimento / Condição Inicial</div>
          <div class="value">${dueInfo}</div>
          <div style="font-size: 11px; color: #444; margin-top: 4px;">
            Status Atual: <strong>${order.paymentStatus === 'paid' ? 'PAGAMENTO CONFIRMADO' : 'AGUARDANDO QUITAÇÃO'}</strong>
          </div>
        </div>
      </div>

      <div style="margin-top: 12px; padding-top: 10px; border-top: 1px dashed #e5b8c5; font-size: 12px; color: #222;">
        <strong>Termos estabelecidos pelo ADM:</strong> ${termsDescription}
      </div>

      <div style="margin-top: 10px; background: #ffffff; border: 1px solid #e5e5e5; border-radius: 6px; padding: 8px 12px; font-size: 11px;">
        <strong>Chave PIX / Dados para Pagamento:</strong>
        <span style="font-family: monospace; word-break: break-all; margin-left: 6px;">${pixKey}</span>
      </div>
    </div>

    <div class="section-title">3. Cronograma de Parcelas / Pagamento</div>
    <table>
      <thead>
        <tr>
          <th>Parcela</th>
          <th>Forma</th>
          <th>Vencimento / Previsão</th>
          <th>Valor</th>
          <th>Situação</th>
        </tr>
      </thead>
      <tbody>
        ${installmentsRowsHtml}
      </tbody>
    </table>

    <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e5e5; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #777;">
      <div>
        <strong>VASCONCELOS • Cosméticos & Alta Perfumaria</strong><br />
        Condições validadas por ${adminEmail} • Entrega exclusiva VasconcelosExpress sem custo adicional.
      </div>
      <div style="text-align: right;">
        Autenticação do Pedido:<br />
        <strong style="font-family: monospace; color: #111;">${order.id.toUpperCase()}</strong>
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

