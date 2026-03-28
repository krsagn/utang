import { escapeHtml } from '../lib/utils.js';

export const debtCreatedEmail = (
  name: string,
  amount: number,
  currency: string,
  otherPartyName: string,
  title: string,
  role: 'lender' | 'lendee'
) =>
  `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Utang — New Debt</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      background-color: #f0ece4;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      padding: 40px 16px;
      color: #1a1a1a;
    }

    .email-wrapper {
      max-width: 520px;
      margin: 0 auto;
    }

    /* Header */
    .header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 32px;
    }

    .logo-text {
      font-family: 'Clash Display', Georgia, 'Times New Roman', serif;
      font-weight: 600;
      font-size: 20px;
      letter-spacing: 0.08em;
      color: #1a1a1a;
    }

    /* Card */
    .card {
      background: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 2px 20px rgba(0,0,0,0.07);
    }

    .card-top {
      background: #1a1a1a;
      padding: 32px 36px;
      position: relative;
      overflow: hidden;
    }

    .card-top::before {
      content: '';
      position: absolute;
      top: -40px;
      right: -40px;
      width: 160px;
      height: 160px;
      border-radius: 50%;
      background: rgba(255,255,255,0.04);
    }

    .card-top::after {
      content: '';
      position: absolute;
      bottom: -60px;
      right: 40px;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: rgba(255,255,255,0.03);
    }

    .card-top-label {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: rgba(255,255,255,0.45);
      margin-bottom: 10px;
    }

    .card-top-amount {
      font-family: 'Cabinet Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 52px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: 0.08em;
      line-height: 1;
      margin-bottom: 6px;
    }

    .card-top-between {
      font-size: 14px;
      color: rgba(255,255,255,0.5);
      font-style: italic;
    }

    .card-top-between strong {
      color: rgba(255,255,255,0.85);
      font-style: normal;
      font-weight: 500;
    }

    .card-body {
      padding: 32px 36px;
    }

    .greeting {
      font-family: 'Cabinet Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #1a1a1a;
      margin-bottom: 12px;
    }

    .message {
      font-size: 15px;
      line-height: 1.65;
      color: #555;
      margin-bottom: 28px;
    }

    .message strong {
      color: #1a1a1a;
      font-weight: 500;
    }

    /* Debt details pill */
    .detail-row {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      background: #f7f5f0;
      border-radius: 14px;
      padding: 18px 20px;
      margin-bottom: 28px;
    }

    .detail-icon {
      width: 36px;
      height: 36px;
      background: #1a1a1a;
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 1px;
    }

    .detail-icon svg {
      width: 16px;
      height: 16px;
    }

    .detail-label {
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: #aaa;
      margin-bottom: 3px;
    }

    .detail-value {
      font-size: 15px;
      font-weight: 500;
      color: #1a1a1a;
    }

    /* Status badge */
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #fff3cd;
      border: 1px solid #f0d060;
      border-radius: 100px;
      padding: 4px 12px;
      font-size: 12px;
      font-weight: 500;
      color: #8a6d00;
      margin-bottom: 28px;
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #d4a800;
    }

    /* CTA Button */
    .cta-button {
      display: block;
      background: #1a1a1a;
      color: #ffffff;
      text-decoration: none;
      text-align: center;
      font-family: 'Cabinet Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 0.3px;
      padding: 16px 24px;
      border-radius: 14px;
      margin-bottom: 20px;
    }

    /* Footer */
    .footer {
      margin-top: 28px;
      padding: 0 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .footer-brand {
      font-family: 'Cabinet Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 13px;
      font-weight: 700;
      color: #aaa;
    }

    .footer-note {
      font-size: 12px;
      color: #bbb;
    }

    /* Divider */
    .divider {
      height: 1px;
      background: #f0ece4;
      margin: 0 36px;
    }
  </style>
</head>
<body>

  <div class="email-wrapper">

    <!-- Logo -->
    <div class="header">
      <span class="logo-text">utang!</span>
    </div>

    <!-- Card -->
    <div class="card">

      <!-- Dark top section -->
      <div class="card-top">
        <div class="card-top-label">New debt recorded</div>
        <div class="card-top-amount">${escapeHtml(currency)} ${amount}</div>
        <div class="card-top-between">between <strong>you</strong> and <strong>${escapeHtml(otherPartyName)}</strong></div>
      </div>

      <div class="divider"></div>

      <!-- Body -->
      <div class="card-body">

        <div class="greeting">Hey ${escapeHtml(name)} 👋</div>

        <p class="message">
          No stress, but it's on the books! A debt of <strong>${escapeHtml(currency)} ${amount}</strong> has been recorded between you and <strong>${escapeHtml(otherPartyName)}</strong>. You currently <strong>${role === 'lendee' ? 'owe' : 'are owed'}</strong> this amount.
        </p>

        <!-- Description detail -->
        <div class="detail-row">
          <div class="detail-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div>
            <div class="detail-label">Description</div>
            <div class="detail-value">${escapeHtml(title)}</div>
          </div>
        </div>

        <!-- Status -->
        <div class="status-badge">
          <span class="status-dot"></span>
          Pending
        </div>

        <!-- TODO: Replace href with real debt URL once frontend routing is stable -->
        <a href="#" class="cta-button">View Debt →</a>

      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <span class="footer-brand">utang</span>
      <span class="footer-note">No awkward conversations needed 😌</span>
    </div>

  </div>

</body>
</html>`;
