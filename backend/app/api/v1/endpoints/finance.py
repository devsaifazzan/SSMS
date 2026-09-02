from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from app.core.database import get_db
from app.models.domain import StudentInvoice, Payment
from app.schemas.domain import APIResponse, StudentInvoiceCreate, StudentInvoiceResponse, PaymentCreate, PaymentResponse

router = APIRouter()

@router.get("/invoices", response_model=APIResponse)
async def get_invoices(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(StudentInvoice))
    invoices = result.scalars().all()
    return APIResponse(status="success", data=[StudentInvoiceResponse.model_validate(i) for i in invoices])

@router.post("/invoices", response_model=APIResponse)
async def create_invoice(invoice_in: StudentInvoiceCreate, db: AsyncSession = Depends(get_db)):
    new_invoice = StudentInvoice(**invoice_in.model_dump())
    db.add(new_invoice)
    await db.commit()
    await db.refresh(new_invoice)
    return APIResponse(status="success", data=StudentInvoiceResponse.model_validate(new_invoice))

@router.post("/payments", response_model=APIResponse)
async def create_payment(payment_in: PaymentCreate, db: AsyncSession = Depends(get_db)):
    # Verify invoice exists
    result = await db.execute(select(StudentInvoice).filter(StudentInvoice.id == payment_in.invoice_id))
    invoice = result.scalars().first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
        
    new_payment = Payment(**payment_in.model_dump())
    db.add(new_payment)
    
    # Update invoice status if fully paid
    # Simplification: if payment covers or exceeds amount due
    if payment_in.amount_paid >= invoice.amount_due:
        invoice.status = "Paid"
    elif payment_in.amount_paid > 0:
        invoice.status = "Partially Paid"
        
    await db.commit()
    await db.refresh(new_payment)
    return APIResponse(status="success", data=PaymentResponse.model_validate(new_payment))
