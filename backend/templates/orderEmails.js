const escapeHtml = (value = "") =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char],
  );

const formatCurrency = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN")}`;

const orderEmailTemplate = ({ customerName, heading, message, order }) => {
  return `
  <!DOCTYPE html>
  <html>
  <body style="margin:0; padding:0; background:#f4f5f7; font-family:Arial,sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0"
      style="padding:30px 10px; background:#f4f5f7;">
      <tr>
        <td align="center">

          <table width="600" cellpadding="0" cellspacing="0"
            style="max-width:600px; background:#ffffff; border-radius:12px; overflow:hidden;">

            <tr>
              <td align="center"
                style="background:#e85d04; padding:28px; color:#ffffff;">
                <h1 style="margin:0; font-size:30px;">🍔 ZipBite</h1>
                <p style="margin:8px 0 0;">Your Food, Your Way!</p>
              </td>
            </tr>

            <tr>
              <td style="padding:30px; color:#333333;">

                <h2 style="color:#e85d04; margin-top:0;">
                  ${escapeHtml(heading)}
                </h2>

                <p>Hi ${escapeHtml(customerName || "Food Lover")}! 👋</p>

                <p style="line-height:1.6;">
                  ${escapeHtml(message)}
                </p>

                <h3 style="border-bottom:1px solid #eeeeee; padding-bottom:12px;">
                  Order Summary
                </h3>

                <p><strong>Order ID:</strong> ${escapeHtml(order._id)}</p>
                <p><strong>Status:</strong>
                  ${escapeHtml(order.orderStatus.replaceAll("_", " "))}
                </p>
                <p><strong>Payment:</strong> ${escapeHtml(order.paymentMethod)}</p>

                <table width="100%" cellpadding="10"
                  style="background:#fafafa; border-radius:8px;">

                  <tr>
                    <td>Subtotal</td>
                    <td align="right">${formatCurrency(order.subtotal)}</td>
                  </tr>

                  <tr>
                    <td>Delivery Fee</td>
                    <td align="right">${formatCurrency(order.deliveryFee)}</td>
                  </tr>

                  <tr>
                    <td>Tax</td>
                    <td align="right">${formatCurrency(order.tax)}</td>
                  </tr>

                  <tr>
                    <td style="border-top:1px solid #dddddd;">
                      <strong>Total Amount</strong>
                    </td>
                    <td align="right" style="border-top:1px solid #dddddd; color:#e85d04;">
                      <strong>${formatCurrency(order.totalAmount)}</strong>
                    </td>
                  </tr>

                </table>

                <p style="margin-top:28px; line-height:1.6;">
                  Thank you for choosing ZipBite! ❤️
                  <br/>We hope you enjoy every bite.
                </p>

              </td>
            </tr>

            <tr>
              <td align="center"
                style="background:#222222; color:#ffffff; padding:20px; font-size:13px;">
                © ${new Date().getFullYear()} ZipBite. All rights reserved.
                <br/>Made with ❤️ for food lovers.
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
};

export default orderEmailTemplate;
