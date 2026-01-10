// app/api/orders/route.js (OPTIONAL - if you want to handle the new fields)
export async function POST(request) {
  try {
    const body = await request.json();
    
    // New fields added: orderDate, deliveryDate, email, tax, shipping, profitMargin
    const newOrder = {
      orderId: body.orderId,
      transactionType: body.transactionType,
      orderSource: body.orderSource,
      paymentStatus: body.paymentStatus,
      deliveryStatus: body.deliveryStatus,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerAddress: body.customerAddress,
      customerEmail: body.customerEmail,
      products: body.products,
      discount: body.discount || 0,
      courier: body.courier || 0,
      tax: body.tax || 0,
      shipping: body.shipping || 0,
      totalSell: body.totalSell,
      netProfit: body.netProfit,
      profitMargin: body.profitMargin,
      dueAmount: body.dueAmount,
      paidAmount: body.paidAmount,
      isConfirmedSell: body.isConfirmedSell,
      orderDate: body.orderDate || new Date().toISOString(),
      deliveryDate: body.deliveryDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Save to database or return mock response
    return Response.json({
      success: true,
      message: 'Order created successfully',
      order: newOrder
    });
    
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}