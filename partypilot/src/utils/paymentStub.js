export async function simulatePayment(amount, payPercent) {
  const txnRef = 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase();
  return {
    status: 'success',
    txnRef,
    paidAmount: payPercent === 25 ? amount * 0.25 : amount
  };
}
