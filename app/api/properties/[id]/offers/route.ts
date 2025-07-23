import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authService } from '@/lib/security/auth'
import { Logger } from '@/lib/monitoring/logger'
import { emailService } from '@/lib/integrations/email'
import { z } from 'zod'

const createOfferSchema = z.object({
  amount: z.number().positive('Offer amount must be positive'),
  message: z.string().optional(),
  buyerName: z.string().min(1, 'Buyer name is required'),
  buyerEmail: z.string().email('Valid email is required'),
  buyerPhone: z.string().min(1, 'Phone number is required'),
  financingConfirmed: z.boolean().default(false),
  viewingRequested: z.boolean().default(false),
  conditions: z.array(z.string()).default([])
})

export async function POST(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    // Extract the property id from the pathname, e.g. /api/properties/123/offers
    const id = pathname.split('/').at(-2);
    if (!id) {
      return NextResponse.json(
        { error: 'Property ID not found in URL' },
        { status: 400 }
      );
    }
    const body = await request.json();
    const validatedData = createOfferSchema.parse(body);

    // Get property details
    const property = await prisma.property.findUnique({
      where: { id }
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    if (property.status !== 'AVAILABLE') {
      return NextResponse.json(
        { error: 'Property is no longer available' },
        { status: 400 }
      );
    }

    // Create offer record
    const offer = await prisma.offer.create({
      data: {
        propertyId: id,
        buyerId: 'anonymous', // For now, anonymous offers
        sellerId: 'property-owner', // Would be linked to actual property owner
        amount: validatedData.amount,
        currency: 'EUR',
        message: validatedData.message,
        conditions: validatedData.conditions,
        status: 'PENDING',
      }
    });

    // Send notification email to property owner
    // In a real app, you'd get the owner's email from the property record
    await emailService.sendEmail({
      to: 'property-owner@example.com', // Would be actual owner email
      subject: `Nieuw bod ontvangen - ${property.address}`,
      html: `
        <h2>Nieuw bod ontvangen</h2>
        <p>Je hebt een nieuw bod ontvangen op je woning:</p>
        <ul>
          <li><strong>Adres:</strong> ${property.address}</li>
          <li><strong>Bod:</strong> €${validatedData.amount.toLocaleString()}</li>
          <li><strong>Koper:</strong> ${validatedData.buyerName}</li>
          <li><strong>Email:</strong> ${validatedData.buyerEmail}</li>
          <li><strong>Telefoon:</strong> ${validatedData.buyerPhone}</li>
          ${validatedData.message ? `<li><strong>Bericht:</strong> ${validatedData.message}</li>` : ''}
        </ul>
        <p>Log in op je dashboard om te reageren op dit bod.</p>
      `
    });

    // Send confirmation email to buyer
    await emailService.sendEmail({
      to: validatedData.buyerEmail,
      subject: `Bod bevestiging - ${property.address}`,
      html: `
        <h2>Bod bevestiging</h2>
        <p>Bedankt voor je bod op ${property.address}.</p>
        <p><strong>Jouw bod:</strong> €${validatedData.amount.toLocaleString()}</p>
        <p>De eigenaar zal binnenkort reageren op je bod. Je ontvangt een email zodra er nieuws is.</p>
      `
    });

    Logger.audit('Property offer created', {
      propertyId: id,
      offerId: offer.id,
      amount: validatedData.amount,
      buyerEmail: validatedData.buyerEmail
    });

    return NextResponse.json({
      success: true,
      offerId: offer.id,
      message: 'Je bod is verzonden naar de eigenaar'
    });

  } catch (error) {
    Logger.error('Property offer creation failed', error as Error, {
      // propertyId: params.id
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to submit offer' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    // Extract the property id from the pathname, e.g. /api/properties/123/offers
    const id = pathname.split('/').at(-2);
    if (!id) {
      return NextResponse.json(
        { error: 'Property ID not found in URL' },
        { status: 400 }
      );
    }
    // Get all offers for this property (for property owner)
    const offers = await prisma.offer.findMany({
      where: { propertyId: id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        amount: true,
        currency: true,
        status: true,
        message: true,
        conditions: true,
        createdAt: true,
        buyer: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({ offers });

  } catch (error) {
    Logger.error('Property offers retrieval failed', error as Error, {
      // propertyId: params.id
    });

    return NextResponse.json(
      { error: 'Failed to retrieve offers' },
      { status: 500 }
    );
  }
}