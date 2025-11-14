
export async function simulatePayment(totalAmount, payPercent) {
  const paidAmount = Math.round(totalAmount * (payPercent / 100));
  const txnRef = "MOCK-" + Date.now();
  return { paidAmount, status: "success", txnRef };
}
